/**
 * Firebase project config for the vynl app.
 *
 * These values are public identifiers (NOT secrets). Security is enforced by
 * Firebase security rules, not by hiding these values.
 */
export const firebaseConfig = {
  apiKey: 'AIzaSyDZhk_riY8OIjDI21eGpJ0saeRXWJN1MBU',
  authDomain: 'vynl-95525.firebaseapp.com',
  projectId: 'vynl-95525',
  storageBucket: 'vynl-95525.firebasestorage.app',
  messagingSenderId: '673507731053',
  appId: '1:673507731053:web:8fd54dbc80089c87bb4164',
};

/**
 * True when the config above has been filled in. Used to decide whether to
 * attempt Firebase operations or fall through to the local dev flow.
 */
export const isFirebaseConfigured = () =>
  !Object.values(firebaseConfig).some((v) => v.startsWith('PASTE_'));
