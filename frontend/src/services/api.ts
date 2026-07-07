import axios from "axios";
import Constants from "expo-constants";
import { useUserStore } from "../store/userStore";

const BASE_URL =
  (Constants.expoConfig?.extra?.apiUrl as string) ||
  "https://0z562xts-3000.euw.devtunnels.ms";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = useUserStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401 → try to refresh, then retry once
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { refreshToken, setTokens } = useUserStore.getState();
        if (!refreshToken) throw new Error("No refresh token");
        const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, {
          refreshToken,
        });
        setTokens(data.accessToken, data.refreshToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        useUserStore.getState().logout();
      }
    }
    return Promise.reject(error);
  },
);

// ── Auth ──────────────────────────────────────────────────────────────────────

export const apiCreateChild = async (name: string, pin: string) => {
  const { data } = await api.post("/api/auth/create/child", {
    display_name: name,
    pin,
    age: 6,
  });
  return data; // { accessToken, refreshToken, child }
};

export const apiLoginChild = async (name: string, pin: string) => {
  const { data } = await api.post("/api/auth/login/child", {
    display_name: name,
    pin,
  });
  return data;
};

// ── Topics ────────────────────────────────────────────────────────────────────

export interface ApiTopic {
  _id: string;
  slug: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  icon: string;
  color: string;
  min_age: number;
  max_age: number;
  is_free: boolean;
  lesson_count: number;
  completed_count: number;
}

export const apiGetTopics = async (): Promise<ApiTopic[]> => {
  const { data } = await api.get("/api/topics");
  return data.topics;
};

// ── Lessons ───────────────────────────────────────────────────────────────────

export interface ApiLesson {
  _id: string;
  position: number;
  is_free: boolean;
  letter: {
    letter: string;
    name_en: string;
    name_ar: string;
    forms: { isolated: string; initial: string; medial: string; final: string };
  };
}

export const apiGetTopicLessons = async (topicId: string): Promise<ApiLesson[]> => {
  const { data } = await api.get(`/api/topics/${topicId}/lessons`);
  return data.lessons;
};

// ── Exercises ─────────────────────────────────────────────────────────────────

export type ApiExercise =
  | { type: 'listen_tap'; order: number; letter: string; name_en: string; name_ar: string; audio_url: string }
  | { type: 'match_name'; order: number; letter: string; name_en: string; name_ar: string; forms: { isolated: string; initial: string; medial: string; final: string } }
  | { type: 'tracing'; order: number; letter: string; name_en: string; svg_path: string }
  | { type: 'tap_letter'; order: number; letter: string; name_en: string; name_ar: string };

export const apiGetLessonExercises = async (lessonId: string): Promise<ApiExercise[]> => {
  const { data } = await api.get(`/api/lessons/${lessonId}/exercises`);
  return data.exercises;
};

// ── Progress ──────────────────────────────────────────────────────────────────

export const apiSubmitProgress = async (
  lessonId: string,
  stars: number,
  accuracy: number,
  timeSeconds: number,
) => {
  await api
    .post("/api/progress/complete", {
      lesson_id: lessonId,
      stars,
      accuracy_pct: accuracy,
      time_spent_seconds: timeSeconds,
    })
    .catch(() => {}); // Silently fail — progress is also stored locally
};

export default api;
