import { create } from 'zustand';
import { courseApi, mockCourses, mockCourseDetail, type Course, type CourseDetail } from '@/lib/api';

interface CourseState {
  courses: Course[];
  currentCourse: CourseDetail | null;
  loading: boolean;
  error: string | null;
  fetchCourses: (params?: { language?: string; level?: number }) => Promise<void>;
  fetchCourseDetail: (id: string) => Promise<void>;
}

export const useCourseStore = create<CourseState>((set) => ({
  courses: [],
  currentCourse: null,
  loading: false,
  error: null,

  fetchCourses: async (params) => {
    set({ loading: true, error: null });
    try {
      const courses = await courseApi.list(params);
      set({ courses, loading: false });
    } catch {
      // Fallback to mock
      let filtered = [...mockCourses];
      if (params?.language && params.language !== '全部') {
        filtered = filtered.filter((c) => c.language === params.language);
      }
      if (params?.level) {
        filtered = filtered.filter((c) => c.level === params.level);
      }
      set({ courses: filtered, loading: false });
    }
  },

  fetchCourseDetail: async (id) => {
    set({ loading: true, error: null });
    try {
      const course = await courseApi.detail(id);
      set({ currentCourse: course, loading: false });
    } catch {
      // Fallback to mock
      set({ currentCourse: { ...mockCourseDetail, id }, loading: false });
    }
  },
}));
