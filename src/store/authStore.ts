import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  init: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchWithAuth: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
  user: null,
  isAuthenticated: false,
  token: null,

  // Initialize authentication state based on stored token
  init: () => {
    const state = get();
    if (state.token && state.user) {
      set({ isAuthenticated: true });
    }
  },
      
      login: async (email: string, password: string): Promise<void> => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Login failed');
          set({ user: data.user, isAuthenticated: true, token: data.token });
        } catch (err) {
          throw err;
        }
      },

      register: async (name: string, email: string, password: string): Promise<void> => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Registration failed');
          set({ user: data.user, isAuthenticated: true, token: data.token });
        } catch (err) {
          throw err;
        }
      },
      
      logout: (): void => {
        set({ user: null, isAuthenticated: false, token: null });
      },

      fetchWithAuth: async (input: RequestInfo, init: RequestInit = {}): Promise<Response> => {
        const token = get().token;
        const headers = {
          ...(init.headers || {}),
          Authorization: token ? `Bearer ${token}` : '',
        };
        return fetch(input, { ...init, headers });
      },
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        if (state && state.token && state.user) {
          state.isAuthenticated = true;
        }
      },
    }
  )
);