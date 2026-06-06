CREATE TABLE houses (
  id            house_enum        PRIMARY KEY,
  display_name  text              NOT NULL,
  hindi_name    text,
  slogan        text,
  primary_color text              NOT NULL,  -- hex, from brand palette
  default_dark  boolean           NOT NULL DEFAULT false,
  created_at    timestamptz       NOT NULL DEFAULT NOW()
);

ALTER TABLE houses ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read houses
CREATE POLICY "houses_read" ON houses
  FOR SELECT TO authenticated USING (true);

-- No one can write houses via API (seed only)
CREATE POLICY "houses_no_write" ON houses
  FOR ALL TO authenticated USING (false);
