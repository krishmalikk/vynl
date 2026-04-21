import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { firebaseConfig, isFirebaseConfigured } from '../config/firebaseConfig';

let app: FirebaseApp | null = null;

/**
 * Returns the shared FirebaseApp, or null if config hasn't been filled in.
 * Both auth and Firestore consume this so they share one app instance.
 */
export const getFirebaseApp = (): FirebaseApp | null => {
  if (!isFirebaseConfigured()) return null;
  if (app) return app;
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return app;
};
