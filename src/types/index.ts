export type UserType = 'fresher' | 'student_25b' | 'student_other';

export type House = 'tinkerers' | 'wanderers' | 'strategists' | 'mavericks';

export interface AuthData {
  userType?: UserType;
  email?: string;
  otpNext?: string;
  displayName?: string;
  iit?: string;
  iitLabel?: string;
  roll?: string;
  gender?: 'man' | 'woman' | 'undisclosed';
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
  UserType: undefined;
  FresherPath: undefined;
  FresherEmail: undefined;
  IitbEmail: undefined;
  Otp: { email: string; next: 'ProfileName'; userType: 'fresher' | 'student_25b'; iit: string };
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
  Discover: undefined;
  Introductions: undefined;
  Leaderboard: undefined;
  Date: undefined;
};

export type ProfileStackParamList = {
  HouseHome: undefined;
  MyProfile: undefined;
  OtherProfile: { userId: string };
  EditProfile: undefined;
  Settings: undefined;
};
