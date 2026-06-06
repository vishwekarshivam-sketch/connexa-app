CREATE TABLE points_ledger (
  id          bigserial   PRIMARY KEY,
  user_id     uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  house       house_enum  NOT NULL,
  points      int         NOT NULL,
  reason      text        NOT NULL,
  dedupe_key  text        UNIQUE,         -- prevents double-award; format: 'reason:entity_id:user_id'
  voided      boolean     NOT NULL DEFAULT false,
  voided_by   uuid        REFERENCES users(id) ON DELETE SET NULL,
  voided_at   timestamptz,
  created_at  timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX ledger_user_idx ON points_ledger (user_id, created_at DESC) WHERE voided = false;
CREATE INDEX ledger_house_idx ON points_ledger (house, created_at DESC) WHERE voided = false;

-- Materialized view: house totals (refreshed every 60s by cron)
CREATE MATERIALIZED VIEW house_scores AS
  SELECT house, SUM(points) AS total_points
  FROM points_ledger
  WHERE voided = false
  GROUP BY house;

CREATE UNIQUE INDEX house_scores_idx ON house_scores (house);

-- Materialized view: individual totals (refreshed every 60s)
CREATE MATERIALIZED VIEW user_scores AS
  SELECT user_id, house, SUM(points) AS total_points
  FROM points_ledger
  WHERE voided = false
  GROUP BY user_id, house;

CREATE UNIQUE INDEX user_scores_idx ON user_scores (user_id);

CREATE TABLE season_config (
  id              int         PRIMARY KEY DEFAULT 1 CHECK (id = 1),  -- singleton
  season_start    date        NOT NULL,
  season_end      date        NOT NULL,
  crowning_done   boolean     NOT NULL DEFAULT false,
  crowned_user_id uuid        REFERENCES users(id) ON DELETE SET NULL,
  crowned_at      timestamptz
);

CREATE TABLE season_final_houses (
  house       house_enum  PRIMARY KEY,
  final_rank  int         NOT NULL,
  final_score int         NOT NULL,
  frozen_at   timestamptz NOT NULL DEFAULT NOW()
);

ALTER TABLE points_ledger ENABLE ROW LEVEL SECURITY;

-- Users read own ledger rows
CREATE POLICY "ledger_read_own" ON points_ledger
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Admin reads all
CREATE POLICY "ledger_admin_all" ON points_ledger
  FOR ALL TO authenticated USING (
    (SELECT is_admin FROM users WHERE id = auth.uid())
  );
