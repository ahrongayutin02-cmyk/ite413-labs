import { isFirebaseConfigured } from './firebase.config';

describe('isFirebaseConfigured', () => {
  const realConfig = {
    apiKey: 'AIzaSyExample',
    authDomain: 'demo.firebaseapp.com',
    projectId: 'demo-project',
    storageBucket: 'demo.appspot.com',
    messagingSenderId: '123456789',
    appId: '1:123456789:web:abcdef',
  };

  it('rejects undefined and placeholder configs', () => {
    expect(isFirebaseConfigured(undefined)).toBe(false);
    expect(
      isFirebaseConfigured({
        ...realConfig,
        apiKey: 'YOUR_API_KEY',
        projectId: 'YOUR_PROJECT_ID',
      }),
    ).toBe(false);
  });

  it('accepts a real-looking web config', () => {
    expect(isFirebaseConfigured(realConfig)).toBe(true);
  });
});
