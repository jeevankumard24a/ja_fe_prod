// stores/authStore.ts
import { create } from "zustand";

interface AuthState {
  user_id: string | null;
  user_name: string | null;
  isAuthenticated: boolean;
  setUser: (user_id: string, user_name: string) => void;
  clearUser: () => void;
}

const authStore = create<AuthState>((set) => ({
  user_id: null,
  user_name: null,
  isAuthenticated: false,
  setUser: (user_id, user_name) =>
    set({ user_id, user_name, isAuthenticated: true }),
  clearUser: () =>
    set({ user_id: null, user_name: null, isAuthenticated: false }),
}));

export default authStore;
