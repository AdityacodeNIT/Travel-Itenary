import { create } from 'zustand';

interface User {
  _id: string;
  email: string;
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  hydrateFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Always start with null — avoids SSR/CSR hydration mismatch.
  // Call hydrateFromStorage() inside a useEffect to load from localStorage client-side.
  user: null,
  setUser: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
    set({ user });
  },
  hydrateFromStorage: () => {
    const stored = localStorage.getItem('user');
    if (stored) {
      set({ user: JSON.parse(stored) });
    }
  },
}));
