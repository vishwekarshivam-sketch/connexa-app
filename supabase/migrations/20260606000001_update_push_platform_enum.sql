-- Update push_platform_enum to include 'ios' and 'fcm'
ALTER TYPE push_platform_enum ADD VALUE IF NOT EXISTS 'ios';
ALTER TYPE push_platform_enum ADD VALUE IF NOT EXISTS 'fcm';
