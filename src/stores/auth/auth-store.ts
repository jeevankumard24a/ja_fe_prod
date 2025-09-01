"use client";

import { create } from "zustand";

type User = { user_id: string; user_name: string };

type AuthState = {
    user: User | null;
    accessToken: string | null;
    actionId?: string | null;

    // actions
    setSession: (p: { user: User; accessToken: string; actionId?: string | null }) => void;
    updateAccessToken: (token: string | null) => void;
    clearSession: () => void;
};

export const useAuthStore = create<AuthState>()((set) => ({
    user: null,
    accessToken: null,
    actionId: null,

    setSession: ({ user, accessToken, actionId }) =>
        set({ user, accessToken, actionId: actionId ?? null }),
    updateAccessToken: (token) => set({ accessToken: token }),
  clearSession: () => set({ user: null, accessToken: null, actionId: null }),
}));

// Optional: convenient getter for non-React code
export const getAccessToken = () => useAuthStore.getState().accessToken;
