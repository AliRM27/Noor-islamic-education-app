import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@noor_user_v2';

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

  // Actions
  setName: (name: string) => void;
  setTokens: (access: string, refresh: string) => void;
  setUser: (data: Partial<UserStore>) => void;
  markLesson: (lessonId: string, stars: number) => void;
  setOnboarded: (v: boolean) => void;
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
        set({ ...data, isAuthenticated: !!data.accessToken });
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
      progress: s.progress,
    }));
  },
}));
