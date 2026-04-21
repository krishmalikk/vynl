import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from 'firebase/auth';
import { signOut as firebaseSignOut } from '../services/firebaseAuth';

interface AppStore {
  /** Firebase auth listener has fired at least once — safe to route. */
  authReady: boolean;
  /** Derived from a real Firebase user OR the dev-override flag. */
  isAuthed: boolean;
  /** User has seen Welcome + passed through Auth (persisted). */
  hasCompletedOnboarding: boolean;
  /** Local-only dev bypass — persisted so a re-launch keeps you signed in. */
  devOverride: boolean;
  /** Display email from Firebase user or dev stub. */
  email: string | null;

  /** Called by the Firebase onAuthStateChanged listener on every change. */
  setAuthState: (user: User | null) => void;
  /** Called once the Firebase listener has produced its first value. */
  markAuthReady: () => void;
  /** Dev-mode shortcut: flip isAuthed without hitting Firebase. */
  enableDevOverride: () => void;
  completeOnboarding: () => void;
  signOut: () => Promise<void>;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      authReady: false,
      isAuthed: false,
      hasCompletedOnboarding: false,
      devOverride: false,
      email: null,

      setAuthState: (user) => {
        const devOverride = get().devOverride;
        set({
          isAuthed: !!user || devOverride,
          email: user?.email ?? (devOverride ? get().email : null),
          hasCompletedOnboarding:
            !!user || devOverride || get().hasCompletedOnboarding,
        });
      },

      markAuthReady: () => set({ authReady: true }),

      enableDevOverride: () =>
        set({
          devOverride: true,
          isAuthed: true,
          hasCompletedOnboarding: true,
          email: 'dev@vynl.local',
        }),

      completeOnboarding: () => set({ hasCompletedOnboarding: true }),

      signOut: async () => {
        try {
          await firebaseSignOut();
        } catch {
          /* ignore — may not be configured */
        }
        set({ isAuthed: false, devOverride: false, email: null });
      },
    }),
    {
      name: 'app-store',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist onboarding + devOverride. Firebase manages its own
      // auth persistence via AsyncStorage, so we don't mirror isAuthed/email
      // here — the auth listener will rehydrate them.
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        devOverride: state.devOverride,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.devOverride) {
          state.isAuthed = true;
          state.email = 'dev@vynl.local';
        }
      },
    }
  )
);
