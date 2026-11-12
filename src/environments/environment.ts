// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

  /**
   * Lab 4: paste the Firebase web app config here.
   * Firebase Console -> Project settings -> Your apps -> Web app -> SDK setup.
   *
   * While these values are placeholders the app runs in local demo mode
   * (localStorage) so every CRUD feature still works.
   */
  firebase: {
    apiKey: 'AIzaSyCHkF_CpZKUwo-L-sVODGTel4-GfzC_Hx4',
    authDomain: 'serverlena.firebaseapp.com',
    projectId: 'serverlena',
    storageBucket: 'serverlena.firebasestorage.app',
    messagingSenderId: '222955201733',
    appId: '1:222955201733:web:8199a7e0422c10d8a47cac',
    measurementId: 'G-KX52PX01BD',
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
