CREATE TABLE date_profiles (
  user_id         uuid                    PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name    text                    NOT NULL,
  iit             iit_enum                NOT NULL,
  branch          text                    NOT NULL,
  year            text                    NOT NULL,
  gender          gender_enum             NOT NULL,
  gender_visible  boolean                 NOT NULL DEFAULT true,
  bio             text,                   -- max 150 chars
  status          date_profile_status_enum NOT NULL DEFAULT 'draft',
  unlock_at       timestamptz,            -- freshers only
  created_at      timestamptz             NOT NULL DEFAULT NOW(),
  updated_at      timestamptz             NOT NULL DEFAULT NOW()
);

SELECT apply_updated_at('date_profiles');

CREATE INDEX date_profiles_status_iit_idx ON date_profiles (status, iit, gender)
  WHERE status = 'active';

CREATE TABLE date_photos (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url         text        NOT NULL,
  position    int         NOT NULL DEFAULT 0,
  moderation  text        NOT NULL DEFAULT 'pending',  -- 'pending' | 'ok' | 'flagged'
  created_at  timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX date_photos_user_idx ON date_photos (user_id, position);

CREATE TABLE date_prompt_answers (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt_id   text        NOT NULL,   -- from prompt bank enum
  body        text        NOT NULL,   -- max 120 chars
  position    int         NOT NULL DEFAULT 0
);

CREATE TABLE date_questionnaire_answers (
  user_id     uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id text        NOT NULL,   -- Q1–Q13
  value_slider float,                 -- [0,1] for slider type
  value_tags  text[],                 -- for pickN type
  value_enum  text,                   -- for single-choice type
  updated_at  timestamptz NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, question_id)
);

CREATE TABLE date_prefs (
  user_id         uuid        PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  pref_gender     gender_enum[],
  pref_iits       iit_enum[]  NOT NULL DEFAULT ARRAY['iitb','iitk','iitd','iitm','iitr','iitg','iith','iitkgp']::iit_enum[],
  pref_branches   text[],
  pref_age_min    int,
  pref_age_max    int,
  looking_for     text,
  faith_pref      text,
  updated_at      timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE date_pref_vectors (
  user_id             uuid        PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  vector              float[],
  interest_event_count int        NOT NULL DEFAULT 0,
  updated_at          timestamptz NOT NULL DEFAULT NOW()
);

ALTER TABLE date_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE date_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE date_prompt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE date_questionnaire_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE date_prefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE date_pref_vectors ENABLE ROW LEVEL SECURITY;

-- Date profiles: only active Date users see each other (browse handled via RPC)
CREATE POLICY "date_profiles_read_own" ON date_profiles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "date_profiles_write_own" ON date_profiles
  FOR ALL TO authenticated USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "date_photos_own" ON date_photos
  FOR ALL TO authenticated USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "date_prompts_own" ON date_prompt_answers
  FOR ALL TO authenticated USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "date_questionnaire_own" ON date_questionnaire_answers
  FOR ALL TO authenticated USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "date_prefs_own" ON date_prefs
  FOR ALL TO authenticated USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- PrefVectors: internal only — no client read
CREATE POLICY "pref_vectors_admin_only" ON date_pref_vectors
  FOR ALL TO authenticated USING (
    (SELECT is_admin FROM users WHERE id = auth.uid())
  );
