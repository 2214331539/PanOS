import { create } from "zustand";

import { getStoredToken, setStoredToken } from "@/shared/lib/api/client";

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  signIn: (token: string) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: getStoredToken(),
  isAuthenticated: Boolean(getStoredToken()),
  signIn: (token) => {
    setStoredToken(token);
    set({ token, isAuthenticated: true });
  },
  signOut: () => {
    setStoredToken(null);
    set({ token: null, isAuthenticated: false });
  },
}));
