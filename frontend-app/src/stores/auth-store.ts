import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

export interface User {
  nom: string;
  prenom: string;
  role: string;
  email?: string;
  notification?: string;
  passwordResetApproved?: boolean;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  login: (user: User) => void;
  logout: () => void;
  clearNotification: () => void;
  clearPasswordResetApproved: () => void;
}

const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isLoggedIn: false,
        login: (user: User) => set({ user, isLoggedIn: true }),
        logout: () => set({ user: null, isLoggedIn: false }),
        clearNotification: () =>
          set((state) => ({
            user: state.user ? { ...state.user, notification: undefined } : null,
          })),
        clearPasswordResetApproved: () =>
          set((state) => ({
            user: state.user
              ? { ...state.user, passwordResetApproved: false }
              : null,
          })),
      }),
      {
        name: "auth-store",
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
);

export default useAuthStore;
