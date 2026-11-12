export const environment = {
  production: true,

  /**
   * Fill this in with the same Firebase web app config used in environment.ts
   * before building for production. Placeholders keep the deployed demo in
   * localStorage mode instead of failing at startup.
   */
  firebase: {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_PROJECT_ID.appspot.com',
    messagingSenderId: 'YOUR_SENDER_ID',
    appId: 'YOUR_APP_ID',
  },
};
