// src/stores/uiStore.ts
import { create } from 'zustand';

export type TabId = 'house' | 'discover' | 'introductions' | 'leaderboard' | 'date';
export type HouseId = 'tinkerers' | 'wanderers' | 'strategists' | 'mavericks';
export type ThemeMode = 'system' | 'light' | 'dark';

interface UIState {
  activeTab: TabId;
  notificationSheetOpen: boolean;
  houseTheme: HouseId | null;
  darkMode: ThemeMode;
  setActiveTab: (tab: TabId) => void;
  setNotificationSheetOpen: (open: boolean) => void;
  setHouseTheme: (house: HouseId | null) => void;
  setDarkMode: (mode: ThemeMode) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'house',
  notificationSheetOpen: false,
  houseTheme: null,
  darkMode: 'system',
  setActiveTab: (activeTab) => set({ activeTab }),
  setNotificationSheetOpen: (notificationSheetOpen) => set({ notificationSheetOpen }),
  setHouseTheme: (houseTheme) => set({ houseTheme }),
  setDarkMode: (darkMode) => set({ darkMode }),
}));
