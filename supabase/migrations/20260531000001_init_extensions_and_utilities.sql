-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- trigram search for admin user lookup
CREATE EXTENSION IF NOT EXISTS "unaccent";  -- accent-insensitive search
CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA extensions;

-- Shared updated_at trigger function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Helper: apply updated_at trigger to a table
CREATE OR REPLACE FUNCTION apply_updated_at(target_table text)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  EXECUTE format('
    CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON %I
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  ', target_table);
END;
$$;
