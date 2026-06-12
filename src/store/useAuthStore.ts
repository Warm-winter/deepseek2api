import { create } from 'zustand';
import { authApi, mockUser, type User } from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (nickname: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await authApi.login(email, password);
      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token, loading: false });
    } catch {
      // Fallback to mock
      const mockToken = 'mock-token-' + Date.now();
      localStorage.setItem('token', mockToken);
      set({ user: { ...mockUser, email }, token: mockToken, loading: false });
    }
  },

  register: async (nickname, email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await authApi.register(nickname, email, password);
      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token, loading: false });
    } catch {
      const mockToken = 'mock-token-' + Date.now();
      localStorage.setItem('token', mockToken);
      set({ user: { ...mockUser, nickname, email }, token: mockToken, loading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  fetchCurrentUser: async () => {
    set({ loading: true });
    try {
      const user = await authApi.me();
      set({ user, loading: false });
    } catch {
      // Fallback to mock
      set({ user: mockUser, loading: false });
    }
  },
}));
