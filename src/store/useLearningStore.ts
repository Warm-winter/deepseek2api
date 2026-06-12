import { create } from 'zustand';
import { learningApi, mockLessonContent, mockProgress, type LessonContent, type UserProgress } from '@/lib/api';

interface LearningState {
  currentLesson: LessonContent | null;
  progress: UserProgress | null;
  loading: boolean;
  error: string | null;
  fetchLessonContent: (lessonId: string) => Promise<void>;
  completeLesson: (lessonId: string, score: number) => Promise<void>;
  fetchProgress: () => Promise<void>;
}

export const useLearningStore = create<LearningState>((set) => ({
  currentLesson: null,
  progress: null,
  loading: false,
  error: null,

  fetchLessonContent: async (lessonId) => {
    set({ loading: true, error: null });
    try {
      const content = await learningApi.lessonContent(lessonId);
      set({ currentLesson: content, loading: false });
    } catch {
      // Fallback to mock
      const content = mockLessonContent[lessonId] || mockLessonContent['l1'];
      set({ currentLesson: content, loading: false });
    }
  },

  completeLesson: async (lessonId, score) => {
    set({ loading: true });
    try {
      await learningApi.completeLesson(lessonId, score);
      set({ loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchProgress: async () => {
    set({ loading: true });
    try {
      const progress = await learningApi.progress();
      set({ progress, loading: false });
    } catch {
      set({ progress: mockProgress, loading: false });
    }
  },
}));
