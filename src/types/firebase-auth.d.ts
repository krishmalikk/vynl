// Firebase JS SDK exposes `getReactNativePersistence` via its RN-specific
// bundle (`@firebase/auth/dist/rn/index.js`), which Metro resolves to. The
// default TypeScript types (`firebase/auth/dist/auth/index.d.ts`) don't
// declare it, so we augment the module here.
import type { Persistence } from 'firebase/auth';

declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: unknown): Persistence;
}
