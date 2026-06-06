CREATE TYPE user_type_enum AS ENUM ('fresher', 'non_fresher');
CREATE TYPE user_status_enum AS ENUM ('pending', 'onboarding', 'active', 'suspended', 'deleted');
CREATE TYPE iit_enum AS ENUM ('iitb', 'iitk', 'iitd', 'iitm', 'iitr', 'iitg', 'iith', 'iitkgp');
CREATE TYPE gender_enum AS ENUM ('male', 'female', 'other');
CREATE TYPE house_enum AS ENUM ('tinkerers', 'wanderers', 'strategists', 'mavericks');
CREATE TYPE verification_status_enum AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE verification_method_enum AS ENUM ('email_otp', 'roll_doc');
CREATE TYPE intro_status_enum AS ENUM ('draft', 'posted', 'ig_locked');
CREATE TYPE thread_type_enum AS ENUM ('general', 'prompt', 'archive');
CREATE TYPE message_status_enum AS ENUM ('active', 'deleted');
CREATE TYPE interest_state_enum AS ENUM ('pending', 'mutual', 'expired', 'withdrawn', 'blocked');
CREATE TYPE match_state_enum AS ENUM ('active', 'closed');
CREATE TYPE close_reason_enum AS ENUM ('unmatch', 'block', 'account_deleted');
CREATE TYPE blockhide_kind_enum AS ENUM ('block', 'hide');
CREATE TYPE report_category_enum AS ENUM ('harassment', 'fake', 'inappropriate', 'underage', 'other');
CREATE TYPE report_status_enum AS ENUM ('open', 'reviewing', 'actioned', 'dismissed');
CREATE TYPE date_profile_status_enum AS ENUM ('draft', 'active', 'paused', 'deleted');
CREATE TYPE notification_category_enum AS ENUM (
  'daily_prompt', 'reaction', 'invite_converted', 'retention_bonus',
  'mutual_match', 'streak_milestone', 'house_rank_change', 'monthly_reveal'
);
CREATE TYPE push_platform_enum AS ENUM ('web', 'android');
CREATE TYPE push_status_enum AS ENUM ('active', 'expired');
CREATE TYPE mod_report_type_enum AS ENUM ('chat', 'intro', 'date');
