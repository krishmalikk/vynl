/**
 * Firebase project config for the vynl web app.
 *
 * Paste the config object from your Firebase console:
 *   console.firebase.google.com → Project settings → Your apps → Web app → SDK setup and configuration
 *
 * These values are public identifiers (NOT secrets). They're safe to commit, but you
 * may still want to gitignore this file if you prefer per-env configs.
 */
export const firebaseConfig = {
  apiKey: 'PASTE_API_KEY',
  authDomain: 'PASTE_AUTH_DOMAIN',
  projectId: 'PASTE_PROJECT_ID',
  storageBucket: 'PASTE_STORAGE_BUCKET',
  messagingSenderId: 'PASTE_MESSAGING_SENDER_ID',
  appId: 'PASTE_APP_ID',
};

/**
 * True when the config above has been filled in. Used to decide whether to
 * attempt Firebase operations or fall through to the local dev flow.
 */
export const isFirebaseConfigured = () =>
  !Object.values(firebaseConfig).some((v) => v.startsWith('PASTE_'));
