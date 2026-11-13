# Firebase setup (Lab 4)

> **Already connected.** This project is live against the `serverlena` Firebase
> project; the web config is committed in `src/environments/environment.ts` and
> `environment.prod.ts`, and `firestore.rules` is deployed. The app shows the
> **Firestore** chip. Keep this guide for reference or to point a copy of the
> project at a different Firebase project.

The app supports placeholder Firebase values and falls back to **local demo
mode** (localStorage) when they are present. The CRUD code path is already
written against Firestore, so switching projects is a config-only change.

## 1. Create the project

1. Open <https://console.firebase.google.com/> and create a project, e.g.
   `ite413-menu-crud`.
2. In the project, open **Build → Firestore Database → Create database**.
3. Choose a location and start in **test mode** for the laboratory. Test mode is
   open to the internet for 30 days — do not use it for a real app.
4. Open **Project settings (gear) → Your apps → Web (</>)**.
5. Register the app (nickname `menu-crud-web`) and copy the `firebaseConfig`
   object.

## 2. Paste the config

Edit `src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIza...',
    authDomain: 'ite413-menu-crud.firebaseapp.com',
    projectId: 'ite413-menu-crud',
    storageBucket: 'ite413-menu-crud.appspot.com',
    messagingSenderId: '123456789012',
    appId: '1:123456789012:web:abcdef123456',
  },
};
```

Do the same in `src/environments/environment.prod.ts` if you also want the
production build to use Firestore. Restart `npm start`. The chip in the Add and
Items tabs should now read **Firestore** instead of **Local demo**.

## 3. Lab-only Firestore rules

For the laboratory, the simplest rules that still scope access to the CRUD
collection are:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /menuItems/{itemId} {
      allow read, write: if true;
    }
  }
}
```

The same rules are committed in [`firestore.rules`](../firestore.rules) with
[`firebase.json`](../firebase.json), so you can deploy them instead of pasting:

```bash
npx firebase-tools login
npx firebase-tools use --add          # select the project, alias it "default"
npx firebase-tools deploy --only firestore:rules
```

Or paste them into **Firestore → Rules → Publish**.

> **Never use `allow read, write: if true` in production.** It lets anyone who
> finds the project id read, edit, and delete every menu item. For a real app,
> require Firebase Authentication and validate fields, for example:
>
> ```
> match /menuItems/{itemId} {
>   allow read: if true;
>   allow create, update: if request.auth != null
>     && request.resource.data.name is string
>     && request.resource.data.name.size() >= 2
>     && request.resource.data.price is number
>     && request.resource.data.price >= 0;
>   allow delete: if request.auth != null;
> }
> ```

## 4. Verify

1. Add an item on the Add tab.
2. Open **Firestore → Data** and confirm a document appeared in `menuItems`.
3. Edit and delete the item; the document should update and disappear.
4. Refresh the browser; Firestore data is live through `onSnapshot`.

## Optional: local emulator

If you have Java and the Firebase CLI installed, you can avoid touching a cloud
project:

```bash
npm install -g firebase-tools
firebase emulators:start --only firestore --project demo-menu-crud
```

Then connect the app to the emulator before any Firestore call:

```ts
import { connectFirestoreEmulator } from 'firebase/firestore';

// after getFirestore(app)
connectFirestoreEmulator(db, '127.0.0.1', 8080);
```

The emulator project id must start with `demo-`. This repository does not
include the emulator wiring because the lab expects a real Firebase project;
the local demo backend is the zero-setup fallback.
