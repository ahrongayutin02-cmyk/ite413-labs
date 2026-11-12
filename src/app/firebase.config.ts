import { environment } from '../environments/environment';

export interface FirebaseWebConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

/**
 * The app ships with placeholder values so it can run immediately in local
 * demo mode. Paste a real Firebase web app config into
 * `src/environments/environment.ts` to switch to Firestore.
 */
export function isFirebaseConfigured(
  config: FirebaseWebConfig | undefined,
): config is FirebaseWebConfig {
  if (!config) {
    return false;
  }

  return Boolean(
    config.apiKey &&
      config.projectId &&
      !config.apiKey.startsWith('YOUR_') &&
      !config.projectId.startsWith('YOUR_'),
  );
}
