import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { Locale } from '../i18n/translations';

const STORAGE_KEY = '@noor_user_v2';

function detectLocale(): Locale {
  return Localization.getLocales()[0]?.languageCode === 'de' ? 'de' : 'en';
}

interface UserStore {
  // Auth
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  // Profile
  userId: string | null;
  name: string;
  isOnboarded: boolean;

  // Progress (lessonId → stars earned, 0 = not done)
  progress: Record<string, number>;

  // UI language
  locale: Locale;

  // Actions
  setName: (name: string) => void;
  setTokens: (access: string, refresh: string) => void;
  setUser: (data: Partial<UserStore>) => void;
  markLesson: (lessonId: string, stars: number) => void;
  setOnboarded: (v: boolean) => void;
  setLocale: (locale: Locale) => void;
  logout: () => void;
  load: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  userId: null,
  name: '',
  isOnboarded: false,
  progress: {},
  locale: 'en',

  setName: (name) => {
    set({ name });
    get().persist();
  },

  setTokens: (accessToken, refreshToken) => {
    set({ accessToken, refreshToken, isAuthenticated: true });
    get().persist();
  },

  setUser: (data) => {
    set(data as any);
    get().persist();
  },

  markLesson: (lessonId, stars) => {
    set((s) => {
      const current = s.progress[lessonId] ?? 0;
      if (stars <= current) return s; // only update if better
      const progress = { ...s.progress, [lessonId]: stars };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...s, progress }));
      return { progress };
    });
  },

  setOnboarded: (v) => {
    set({ isOnboarded: v });
    get().persist();
  },

  setLocale: (locale) => {
    set({ locale });
    get().persist();
  },

  logout: () => {
    set({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      userId: null,
      name: '',
      isOnboarded: false,
      progress: {},
    });
    AsyncStorage.removeItem(STORAGE_KEY);
  },

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        const locale: Locale = data.locale ?? detectLocale();
        set({ ...data, locale, isAuthenticated: !!data.accessToken });
      } else {
        set({ locale: detectLocale() });
      }
    } catch {
      // Fresh start
    }
  },

  // Internal helper
  persist: () => {
    const s = get();
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
      accessToken: s.accessToken,
      refreshToken: s.refreshToken,
      userId: s.userId,
      name: s.name,
      isOnboarded: s.isOnboarded,
      locale: s.locale,
      progress: s.progress,
    }));
  },
}));
