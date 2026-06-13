export type UserType = 'fresher' | 'non_fresher';
export type UserStatus = 'pending' | 'onboarding' | 'active' | 'suspended' | 'deleted';
export type Gender = 'male' | 'female' | 'other';
export type House = 'tinkerers' | 'wanderers' | 'strategists' | 'mavericks';

export interface ConnexaUser {
  id: string;
  email: string | null;
  display_name: string | null;
  photo_url: string | null;
  gender: Gender | null;
  iit: string | null;
  branch: string | null;
  hometown: string | null;
  year: string | null; // Changed to string to match DB text
  user_type: UserType | null;
  status: UserStatus;
  house: House | null;
  is_founding_member: boolean;
  founding_100?: boolean;
  is_house_leader: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthData {
  userType?: UserType;
  email?: string;
  otpNext?: string;
  displayName?: string;
  iit?: string;
  iitLabel?: string;
  roll?: string;
  gender?: Gender;
  branch?: string;
  year?: string;
  house?: House;
}

export interface Profile {
  id: string;
  displayName: string;
  memberNo: number;
  iit: string;
  branch: string;
  year?: string;
  house: House;
  photoUrl?: string;
  prompts: { question: string; answer: string }[];
}

// React Navigation param lists
export type AuthStackParamList = {
  Splash: undefined;
  Landing: { code?: string };
  LoginEmail: undefined;
  UserType: undefined;
  FresherPath: undefined;
  FresherEmail: undefined;
  IitbEmail: undefined;
  Otp: { email: string; userType: 'fresher' | 'non_fresher'; iit: string };
  DocForm: undefined;
  Pending: { displayName: string; iitLabel: string; roll: string; email?: string };
  ProfileName: undefined;
  ProfilePhoto: undefined;
  ProfileGender: undefined;
  ProfileBranch: undefined;
  ProfileYear: undefined;
  ProfileDone: undefined;
  SortingInvitation: undefined;
  SortingQuiz: undefined;
  SortingReveal: { house: House };
  SortingCard: { house: House };
};

export type MainTabParamList = {
  House: undefined;
  Introductions: undefined;
  Leaderboard: undefined;
  Date: undefined;
};

export type HouseStackParamList = {
  HouseHome: undefined;
  PromptResponse: undefined;
  HouseChat: undefined;
  ThreadView: { threadId: string; title: string; threadType: 'prompt' | 'general' };
  Discover: undefined;
  Invites: undefined;
  HouseProfile: { userId: string };
  Lore: undefined;
};

export type IntroStackParamList = {
  IntroFeed: undefined;
  IntroDetail: { introId: string };
  IntroCreate: undefined;
  IntroEdit: { introId: string };
};

export type ProfileStackParamList = {
  HouseHome: undefined;
  PromptResponse: undefined;
  HouseChat: undefined;
  ThreadView: { threadId: string; title: string; threadType: 'prompt' | 'general' };
  Discover: undefined;
  Invites: undefined;
  Lore: undefined;
  MyProfile: undefined;
  EditProfile: undefined;
  AdminPanel: undefined;
  OtherProfile: { userId: string };
  Settings: undefined;
  NotificationSettings: undefined;
  DateSettings: undefined;
  AccountSettings: undefined;
  AccountDeletion: undefined;
  AllResponses: undefined;
};

export type AdminStackParamList = {
  AdminDashboard: undefined;
  VerificationQueue: undefined;
  VerificationDetail: { id: string };
  HouseLeaders: undefined;
  Prompts: undefined;
  LoreManagement: undefined;
  ActivityFlags: undefined;
  ContentModeration: undefined;
  ChatReports: undefined;
  IntroReports: undefined;
  DateReports: undefined;
  SeasonControls: undefined;
};

export type DateStackParamList = {
  DateHome: undefined;
  DateLocked: { unlockDate: string };
  DateIntro: undefined;
  DateQuestionnaire: { step?: number };
  DateProfileSetup: { step?: number };
  DateFeed: undefined;
  DateFullProfile: { profileId: string };
  DateDM: { threadId: string; otherUserName: string };
  DateInterests: undefined;
  DateMatches: undefined;
  DateSettings: undefined;
};

export interface DateProfile {
  user_id: string;
  display_name: string;
  iit: string;
  branch: string;
  year: string;
  gender: string;
  gender_visible: boolean;
  bio: string | null;
  status: 'draft' | 'active' | 'paused' | 'deleted';
  unlock_at: string | null;
  created_at: string;
  updated_at: string;
  photos?: ProfilePhoto[];
  prompts?: PromptAnswer[];
}

export interface ProfilePhoto {
  id: string;
  user_id: string;
  url: string;
  position: number;
  moderation: 'pending' | 'ok' | 'flagged';
  created_at: string;
}

export interface PromptAnswer {
  id: string;
  user_id: string;
  prompt_id: string;
  text: string;
  position: number;
  created_at: string;
}

export interface QuestionnaireAnswer {
  user_id: string;
  question_id: string;
  value_slider?: number;
  value_tags?: string[];
  value_enum?: string;
  updated_at: string;
}

export interface DatePrefs {
  user_id: string;
  pref_gender: string[];
  pref_iits: string[];
  pref_branches: string[];
  pref_age_min: number;
  pref_age_max: number;
  looking_for: string | null;
  faith_pref: string | null;
  updated_at: string;
}

export interface Interest {
  id: string;
  from_user: string;
  to_user: string;
  state: 'pending' | 'mutual' | 'expired' | 'withdrawn' | 'blocked';
  match_id: string | null;
  created_at: string;
  expires_at: string;
  resolved_at: string | null;
}

export interface Match {
  id: string;
  user_a: string;
  user_b: string;
  state: string;
  close_reason?: 'unmatch' | 'block' | 'account_deleted';
  created_at: string;
  closed_at?: string;
  closed_by?: string;
}

export interface DMThread {
  id: string;
  match_id: string;
  state: string;
  created_at: string;
  updated_at: string;
}

export interface Invite {
  id: string;
  inviter_id: string;
  invite_code: string;
  used_by: string | null;
  used_at: string | null;
  bonus_earned: boolean;
  bonus_earned_at: string | null;
  created_at: string;
  invitee_name?: string | null;
}

export interface Message {
  id: string;
  thread_id: string;
  sender: string;
  body: string;
  reactions?: any[];
  created_at: string;
}

export interface PublicIntroduction {
  id: string;
  user_id: string;
  display_name: string;
  photo_url: string;
  iit: string;
  branch: string;
  hometown?: string;
  one_liner: string;
  reaction_count: number;
  comment_count: number;
  user_has_reacted?: boolean;
}

export interface Introduction extends PublicIntroduction {
  body: string;
  prompts: PromptAnswer[];
  interests?: string[];
  question?: string | null;
  status?: 'draft' | 'posted';
}

export type NotificationCategory = 
  | 'daily_prompt' 
  | 'reaction' 
  | 'invite_converted' 
  | 'retention_bonus' 
  | 'mutual_match' 
  | 'streak_milestone' 
  | 'house_rank_change' 
  | 'monthly_reveal';

export interface AppNotification {
  id: string;
  user_id: string;
  category: NotificationCategory;
  title: string | null;
  body: string;
  deep_link: string;
  read: boolean;
  push_sent: boolean;
  push_sent_at: string | null;
  created_at: string;
}
