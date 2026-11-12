# ITE 413 — Laboratory Report

**Subject:** ITE 413 — Integrative Programming and Technologies 2
**Activities:** Laboratory Manual #4 (CRUD in Ionic with Tabs), #6
(Virtualization and Containerization), and the CI/CD laboratory
**Project:** `user-crud` — MenuItem CRUD
**Stack:** Ionic 9, Angular 22, Firebase 13 (Firestore), Docker, GitHub Actions

---

## 1. Lab 4 — CRUD operations in Ionic with the Tabs template

### 1.1 Objective

Create an Ionic Angular Tabs application that performs Create, Read, Update, and
Delete against Firebase, then extend the guided `name`/`email` exercise with an
original data model and additional Ionic components.

### 1.2 Data model (enhancement Task 1)

The guided exercise manages a user with `name` and `email`. The enhancement
replaces that with a restaurant **MenuItem**:

| Field | Type | Validation / purpose |
|---|---|---|
| `id` | string | Firestore document id (UUID in local mode) |
| `name` | string | Required, at least 2 characters, trimmed |
| `category` | enum | Appetizer, Main, Dessert, or Drink |
| `price` | number | Required, finite, 0 or more |
| `description` | string | Optional free text, trimmed |
| `available` | boolean | Availability badge in the list |
| `createdAt` | number | Epoch ms; newest-first ordering |

This model is different from the sample Product/Course models and is meaningful
for a restaurant app, matching the theme of the developer's other project.

### 1.3 Screens

**Tab 1 — Create.** A template-driven form with `ion-input`, `ion-select`,
`ion-textarea`, and `ion-toggle`. Invalid fields show inline `ion-note` errors
only after a submit attempt. Saving shows an `ion-loading` overlay and an
`ion-toast` confirmation.

**Tab 2 — Read / Update / Delete.** The list uses:

- `ion-searchbar` — search by name or description.
- `ion-segment` — filter by category (All, Appetizer, Main, Dessert, Drink).
- `ion-item-sliding` + `ion-item-option` — swipe left to delete.
- `ion-modal` — edit a record in a popup with the same validation.
- `ion-toast`, `ion-loading`, `ion-refresher` — feedback, busy state, and
  pull-to-refresh.
- An empty state when there are no rows or no filter matches.

**Tab 3 — About.** Shows which backend is active, the implemented features, the
three lab deliverables, and data tools (restore demo rows / delete all with an
`ion-alert` confirmation).

### 1.4 Firebase integration

`MenuItemService` selects a backend at startup:

- If `environment.firebase` contains a real config (not the `YOUR_...`
  placeholders), it initializes Firebase and uses the `menuItems` collection.
- Otherwise it uses localStorage with three seeded demo rows, so the lab can be
  demonstrated before a Firebase project is connected.

The Firestore path uses the modular SDK v9+ style:

```ts
onSnapshot(collection(db, 'menuItems'), ...);   // live reads
addDoc(collection(db, 'menuItems'), item);      // create
updateDoc(doc(db, 'menuItems', id), changes);   // update
deleteDoc(doc(db, 'menuItems', id));            // delete
```

No AngularFire is used, matching the manual's "Firebase SDK v9+ (no
AngularFire)" note.

### 1.5 Verification

| Check | Result |
|---|---|
| `npm run build` | Passed; bundle written to `www/` |
| `npm run test:ci` | 7 files, **19 tests passed** |
| `npm run lint` | All files pass |
| Browser smoke test | Create → read → search → update → delete passed in Chrome |

Screenshots (captured from the running app):

| Screenshot | What it shows |
|---|---|
| `docs/screenshots/01-add-form.png` | Create form, empty state |
| `docs/screenshots/02-add-form-filled.png` | Validated form filled in |
| `docs/screenshots/03-item-added.png` | Success toast after create |
| `docs/screenshots/04-items-list.png` | Live list with search, segments, badges |
| `docs/screenshots/05-edit-modal.png` | Update modal |
| `docs/screenshots/06-item-updated.png` | Updated record in the list |
| `docs/screenshots/07-delete-slide.png` | Swipe-to-delete option |
| `docs/screenshots/08-about.png` | Backend status and deliverables |
| `docs/screenshots/09-items-desktop.png` | Desktop layout |

> The screenshots above were taken in **local demo mode**. To produce the
> Firebase version for submission, paste a real config
> (`docs/FIREBASE_SETUP.md`), restart the app, add an item, and take the same
> screenshots with the **Firestore** chip visible and the document visible in
> the Firebase console.

---

## 2. Lab 6 — Virtualization and containerization

### 2.1 Dockerfile

The image follows the manual's Node 22 Alpine approach:

```dockerfile
FROM node:22-alpine
WORKDIR /app
ENV NG_CLI_ANALYTICS=false IONIC_CLI_TELEMETRY=false
RUN npm install -g @ionic/cli@latest
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
EXPOSE 8100
HEALTHCHECK ... wget http://127.0.0.1:8100/
CMD ["ionic", "serve", "--host=0.0.0.0", "--port=8100", "--no-open", "--no-interactive"]
```

`.dockerignore` excludes `node_modules`, `.git`, `.angular`, `www`, coverage,
environment files, docs, and scripts from the build context.

### 2.2 Build and run

```powershell
scripts\verify-docker.cmd          # build + run + wait + print image details
scripts\verify-docker.cmd -SmokeTest
```

Manual equivalent:

```bash
docker build -t ionic-crud .
docker images
docker run -d --name ionic-crud-container -p 8100:8100 ionic-crud
docker ps
```

Open <http://localhost:8100>. Record the image name, tag, image id, and size from
`docker images` for the lab sheet. The complete WSL2/Docker Desktop setup,
screenshot checklist, and troubleshooting steps are in
[`DOCKER-RUNBOOK.md`](DOCKER-RUNBOOK.md).

#### Verified result (13 Nov 2026)

After the WSL2 reboot, `scripts\verify-docker.ps1 -SkipBuild -SmokeTest` was run
against the image built by the first `docker build`. The container started,
became healthy, and the browser CRUD smoke test passed against
<http://localhost:8100>.

| Field | Value |
|---|---|
| Docker Desktop / engine | 4.99.0 / 29.9.3 |
| Image name / tag | `ionic-crud:latest` |
| Image ID | `sha256:76354fb7b178f7c913f72d09c609d4acf1f7ac30457312563b3dbf3a76429c12` |
| Image size | 1,691,417,380 bytes (1.69 GB disk usage; 378 MB content) |
| Container name | `ionic-crud-container` |
| Container ID | `13d0458f8317a4649c6257122df8604d5c5e020aa58bb6d9466371f5aea44da2` |
| Host port → container port | `8100 → 8100` |
| Container status | `Up (healthy)` |
| Health checks | 5 consecutive checks with exit code 0 |
| Build duration | ~16 minutes (cold build; `npm ci` took ~9 minutes) |
| Start to healthy | ~65 seconds |
| HTTP check | `200 OK` |
| CRUD smoke test | Passed (create, read, search, update, delete) |

The exact captured command output is in
[`LAB6-DOCKER-EVIDENCE.md`](LAB6-DOCKER-EVIDENCE.md). The Docker Desktop
Containers view is captured in
[`docs/screenshots/10-docker-containers.png`](screenshots/10-docker-containers.png).

### 2.3 Container management

```bash
docker stop ionic-crud-container
docker ps -a
docker start ionic-crud-container
docker rm -f ionic-crud-container
docker images
```

Removing the container does not remove the image and does not delete Firestore
records. The Firebase data lives in the cloud, outside the container.

### 2.4 CRUD test inside the container

Repeat the same checks used in Lab 4: display records, add, update, delete,
refresh, and confirm the Firebase connection still works. If the app does not
load, inspect `docker logs ionic-crud-container` for dependency, environment, or
startup errors.

---

## 3. CI/CD — GitHub Actions and Docker

### 3.1 Pipeline

`.github/workflows/ci-cd.yml` runs on every push and pull request to `main`.

**Continuous Integration — `windows-latest`**

1. Checkout source code.
2. Set up Node.js 24 with npm cache.
3. `npm ci`.
4. `npm run lint`.
5. `npm run test:ci`.
6. `npm run build`.

**Continuous Deployment — `[self-hosted, Windows, X64]`**

1. Checkout latest code.
2. `docker info` (fails fast if Docker Desktop is not running).
3. `docker build -t ionic-crud .`
4. `docker rm -f ionic-crud` (allowed to fail on the first run).
5. `docker run -d --name ionic-crud --restart unless-stopped -p 8100:8100 ionic-crud`
6. Poll `http://localhost:8100/` for up to 60 seconds; on failure print
   `docker logs ionic-crud` and fail the job.

The CD job only runs after CI succeeds and only for a push to `main`.

### 3.2 Self-hosted runner

1. Repository → Settings → Actions → Runners → New self-hosted runner.
2. Select Windows / x64.
3. Run the generated `config.cmd` with the repository URL and temporary token.
4. Start `.\run.cmd` and leave the terminal open.
5. Confirm the runner is **Idle** and has the labels `self-hosted`, `Windows`,
   `X64`.
6. Push a commit to `main` and watch the **Actions** tab.

### 3.3 Automatic deployment test

1. Change a visible label (for example the About tab title).
2. `git add . && git commit -m "Update application version" && git push origin main`
3. Confirm CI runs first and CD starts only after CI is green.
4. Wait for both jobs to finish, refresh <http://localhost:8100>, and confirm the
   change appears.
5. Repeat with another visible change.

---

## 4. Conclusion

The project demonstrates the full path from a client-side CRUD UI to a
containerized deployment and an automated pipeline. Lab 4 established the data
model and the Firebase/local data layer; Lab 6 packaged the same application in
a reproducible Docker image; the CI/CD workflow checks every change, builds the
image on a self-hosted Windows runner, replaces the running container, and
verifies the app responds before marking the deployment successful.

The local demo backend makes the project testable without cloud credentials,
while the Firestore code path is the real integration required by the manual.
