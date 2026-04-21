import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  Auth,
  User,
} from 'firebase/auth';
import { isFirebaseConfigured } from '../config/firebaseConfig';
import { getFirebaseApp } from './firebaseApp';

let auth: Auth | null = null;

/**
 * Lazily initialize Firebase Auth. Returns null if config hasn't been filled in
 * yet, so callers can gracefully fall back to the local dev flow.
 */
const getAuthInstance = (): Auth | null => {
  if (auth) return auth;
  const app = getFirebaseApp();
  if (!app) return null;

  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (e) {
    // `initializeAuth` throws if called twice (e.g. on fast refresh).
    // Fall through to `getAuth` which returns the existing instance.
    auth = getAuth(app);
  }

  return auth;
};

export type AuthUser = User;

export const isAuthAvailable = () => isFirebaseConfigured();

export const subscribeToAuth = (cb: (user: User | null) => void): (() => void) => {
  const a = getAuthInstance();
  if (!a) {
    // Not configured — fire immediately with null so the app knows auth
    // state is "known" (no user), and return a noop unsubscribe.
    cb(null);
    return () => {};
  }
  return onAuthStateChanged(a, cb);
};

export const signIn = async (email: string, password: string): Promise<User> => {
  const a = getAuthInstance();
  if (!a) throw new Error('Firebase is not configured. Paste your config in src/config/firebaseConfig.ts.');
  const cred = await signInWithEmailAndPassword(a, email.trim(), password);
  return cred.user;
};

export const signUp = async (email: string, password: string): Promise<User> => {
  const a = getAuthInstance();
  if (!a) throw new Error('Firebase is not configured. Paste your config in src/config/firebaseConfig.ts.');
  const cred = await createUserWithEmailAndPassword(a, email.trim(), password);
  return cred.user;
};

export const signOut = async (): Promise<void> => {
  const a = getAuthInstance();
  if (!a) return;
  await firebaseSignOut(a);
};

/** Maps Firebase auth error codes to user-friendly copy. */
export const friendlyAuthError = (err: unknown): string => {
  const code = (err as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/invalid-email':
      return 'That email doesn’t look right.';
    case 'auth/missing-password':
      return 'Please enter a password.';
    case 'auth/weak-password':
      return 'Password needs to be at least 6 characters.';
    case 'auth/email-already-in-use':
      return 'An account with that email already exists.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email or password didn’t match.';
    case 'auth/too-many-requests':
      return 'Too many attempts — try again in a minute.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    default:
      return (err as Error)?.message ?? 'Something went wrong. Try again.';
  }
};
