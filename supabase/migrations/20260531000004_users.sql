CREATE TABLE users (
  id                    uuid              PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                 text              NOT NULL UNIQUE,
  user_type             user_type_enum    NOT NULL,
  status                user_status_enum  NOT NULL DEFAULT 'pending',
  display_name          text,
  photo_url             text,
  gender                gender_enum,
  iit                   iit_enum          NOT NULL,
  branch                text,
  year                  text,             -- e.g. '2026', '2025'
  hometown              text,
  house                 house_enum,       -- null until sorted
  house_member_number   int,              -- assigned at sort time
  is_founding_member    boolean           NOT NULL DEFAULT false,
  is_house_leader       boolean           NOT NULL DEFAULT false,
  is_admin              boolean           NOT NULL DEFAULT false,
  streak_current        int               NOT NULL DEFAULT 0,
  streak_last_active    date,
  last_monthly_reveal_seen text,          -- 'YYYY-MM' format
  created_at            timestamptz       NOT NULL DEFAULT NOW(),
  updated_at            timestamptz       NOT NULL DEFAULT NOW()
);

SELECT apply_updated_at('users');

-- Indexes
CREATE INDEX users_house_idx ON users (house) WHERE house IS NOT NULL;
CREATE INDEX users_iit_idx ON users (iit);
CREATE INDEX users_status_idx ON users (status);
CREATE INDEX users_is_admin_idx ON users (is_admin) WHERE is_admin = true;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users read their own row always
CREATE POLICY "users_read_own" ON users
  FOR SELECT TO authenticated USING (id = auth.uid());

-- House members can read each other (for profiles, discover, chat)
CREATE POLICY "users_read_same_house" ON users
  FOR SELECT TO authenticated USING (
    house IS NOT NULL AND
    house = (SELECT house FROM users WHERE id = auth.uid())
  );

CREATE OR REPLACE FUNCTION protect_user_self_update()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF current_user = 'authenticated' AND OLD.id = auth.uid() AND NOT COALESCE(OLD.is_admin, false) THEN
    NEW.id := OLD.id;
    NEW.email := OLD.email;
    NEW.user_type := OLD.user_type;
    NEW.status := OLD.status;
    NEW.iit := OLD.iit;
    NEW.house_member_number := OLD.house_member_number;
    NEW.is_founding_member := OLD.is_founding_member;
    NEW.is_house_leader := OLD.is_house_leader;
    NEW.is_admin := OLD.is_admin;
    NEW.streak_current := OLD.streak_current;
    NEW.streak_last_active := OLD.streak_last_active;
    NEW.last_monthly_reveal_seen := OLD.last_monthly_reveal_seen;
    NEW.created_at := OLD.created_at;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_user_self_update
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION protect_user_self_update();

-- Users update their own row, with sensitive fields protected by trigger.
CREATE POLICY "users_update_own" ON users
  FOR UPDATE TO authenticated USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admins read all
CREATE POLICY "users_admin_read" ON users
  FOR SELECT TO authenticated USING (
    (SELECT is_admin FROM users WHERE id = auth.uid())
  );

CREATE POLICY "users_admin_update" ON users
  FOR UPDATE TO authenticated USING (
    (SELECT is_admin FROM users WHERE id = auth.uid())
  )
  WITH CHECK (
    (SELECT is_admin FROM users WHERE id = auth.uid())
  );
