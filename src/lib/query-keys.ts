// src/lib/query-keys.ts
export interface IntroFilters {
  houseId?: string;
  status?: 'pending' | 'accepted' | 'passed';
  limit?: number;
}

export const keys = {
  // Auth
  session: () => ['session'] as const,

  // House
  houseHome: (houseId: string) => ['house', houseId, 'home'] as const,
  houseMembers: (houseId: string) => ['house', houseId, 'members'] as const,
  houseProfile: (userId: string) => ['house', 'profile', userId] as const,
  housePromptToday: (houseId: string) => ['house', houseId, 'prompt', 'today'] as const,
  housePromptResponses: (promptId: string) => ['house', 'prompt', promptId, 'responses'] as const,
  houseStreak: (userId: string) => ['house', 'streak', userId] as const,

  // Chat
  chatMessages: (threadId: string) => ['chat', threadId, 'messages'] as const,
  chatThreads: (houseId: string) => ['chat', houseId, 'threads'] as const,

  // Leaderboard
  leaderboardHouses: () => ['leaderboard', 'houses'] as const,
  leaderboardIndividual: (houseId: string) => ['leaderboard', 'individual', houseId] as const,

  // Introductions
  introFeed: (filters: IntroFilters) => ['intro', 'feed', filters] as const,
  introDetail: (introId: string) => ['intro', introId] as const,
  myIntro: (userId: string) => ['intro', 'mine', userId] as const,

  // Date
  dateBrowse: () => ['date', 'browse'] as const,
  dateProfile: (userId: string) => ['date', 'profile', userId] as const,
  myDateProfile: () => ['date', 'profile', 'me'] as const,
  dateMatches: () => ['date', 'matches'] as const,
  dmThread: (matchId: string) => ['date', 'thread', matchId] as const,
  dmMessages: (threadId: string) => ['date', 'messages', threadId] as const,
  myInterests: () => ['date', 'interests', 'mine'] as const,

  // Notifications
  notifications: () => ['notifications'] as const,

  // Admin
  adminVerificationQueue: () => ['admin', 'verification'] as const,
  adminFlags: () => ['admin', 'flags'] as const,
  adminReports: (type: 'chat' | 'intro' | 'date') => ['admin', 'reports', type] as const,
} as const;
