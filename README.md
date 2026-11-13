# Menu CRUD — ITE 413 Labs 4, 6, and CI/CD

One Ionic Angular project that completes the three linked laboratory activities:

| Lab | Requirement | Where it lives |
|---|---|---|
| **Lab 4** | Ionic Tabs CRUD with Firebase and a custom data model | `src/app/tab1`, `tab2`, `tab3`, `services/menu-item.service.ts` |
| **Lab 6** | Containerize the existing CRUD app with Docker | `Dockerfile`, `.dockerignore` |
| **CI/CD** | GitHub Actions CI plus self-hosted Windows deployment | `.github/workflows/ci-cd.yml` |

The CRUD entity is a **MenuItem** for a restaurant menu (chosen for the Lab 4
"provide your own data model" enhancement task):

| Field | Type | Purpose |
|---|---|---|
| `id` | string | Firestore document id, or a UUID in local mode |
| `name` | string | Item name shown in the list |
| `category` | `Appetizer \| Main \| Dessert \| Drink` | Filter segment |
| `price` | number | Price in PHP, must be 0 or more |
| `description` | string | Short description |
| `available` | boolean | Whether the kitchen can serve it today |
| `createdAt` | number | Epoch milliseconds, newest first |

## What is implemented

- **Create** — validated form on the Add tab, toast + loading overlay.
- **Read** — live list with `ion-searchbar`, category `ion-segment`, item count,
  availability badge, and a pull-to-refresh `ion-refresher`.
- **Update** — `ion-modal` editor with the same validation rules.
- **Delete** — swipe left on an item (`ion-item-sliding`) or delete all from the
  About tab with an `ion-alert` confirmation.
- **Backend** — Firebase Firestore through the modular SDK (`onSnapshot`,
  `addDoc`, `updateDoc`, `deleteDoc`). A localStorage demo backend with seeded
  rows is kept as a fallback when the config is missing or still a placeholder.

## Quick start

Requirements: Node 22.22.3+ / 24.15+ / 26+, npm, and Chrome or Edge for the
browser smoke test.

```bash
npm ci
npm start          # http://localhost:8100
```

Other commands:

```bash
npm run lint       # ESLint + Angular template rules
npm run test:ci    # 19 unit tests, no watch
npm run build      # production bundle in www/
npm run e2e:smoke  # real Chrome CRUD test + screenshots (server must be running)
```

`npm start` uses port **8100** on purpose: it is the port used by Lab 6 and the
CI/CD workflow.

## Connect Firebase (Lab 4)

This project is already connected to the `serverlena` Firebase project. The web
config is in `src/environments/environment.ts` and `environment.prod.ts`, the
`(default)` Firestore database exists in `asia-southeast1`, and
`firestore.rules` is deployed. The app badge reads **Firestore**.

To point another copy at a different project:

1. Create a Firebase project and a Web app in the Firebase Console.
2. Enable **Cloud Firestore** (test mode is enough for the lab).
3. Replace the web app config in both environment files.
4. Deploy the rules: `firebase deploy --only firestore:rules`.
5. Create the `menuItems` collection by adding the first item through the app.

Full steps, including the lab-only Firestore rules, are in
[`docs/FIREBASE_SETUP.md`](docs/FIREBASE_SETUP.md).

> The Firebase web config is public by design. The security boundary is
> `firestore.rules`, not key secrecy. Never put service-account credentials in
> this client app.

## Lab 6 — Docker

The fastest path is the verification script, which builds the image, replaces
the old container, waits for the dev server, and prints the values needed for
the lab sheet:

```powershell
scripts\verify-docker.cmd
# or: scripts\verify-docker.cmd -SmokeTest
```

Manual commands:

```bash
docker build -t ionic-crud .
docker images
docker run -d --name ionic-crud-container -p 8100:8100 ionic-crud
docker ps
```

Open <http://localhost:8100>. The first request can take 1–2 minutes while
Angular compiles. See [`docs/DOCKER-RUNBOOK.md`](docs/DOCKER-RUNBOOK.md) for
the WSL2/Docker Desktop setup, screenshot checklist, and troubleshooting.

Then manage the container:

```bash
docker stop ionic-crud-container
docker ps -a
docker start ionic-crud-container
docker rm -f ionic-crud-container
docker images          # the image is still there
```

The image is based on `node:22-alpine`, installs `@ionic/cli`, runs `npm ci`,
exposes port 8100, and starts
`ionic serve --host=0.0.0.0 --port=8100 --no-open --no-interactive`. CLI
analytics/telemetry are disabled so the container never waits for a prompt. The
`HEALTHCHECK` waits up to two minutes for the Angular dev server to compile.

## CI/CD — GitHub Actions

The workflow has two jobs:

1. **Continuous Integration** on `windows-latest`:
   checkout → Node 24 → `npm ci` → lint → unit tests → production build.
2. **Continuous Deployment** on `[self-hosted, Windows, X64]`:
   checkout → `docker info` → `docker build -t ionic-crud .` → remove the old
   `ionic-crud`/`ionic-crud-container` container → run the new one as
   `ionic-crud-container` on port 8100 → wait for the container health check
   (up to 5 minutes) → request `http://localhost:8100/`.

### Register the self-hosted runner

1. Push this project to a GitHub repository whose default branch is `main`.
2. Repository → **Settings → Actions → Runners → New self-hosted runner**.
3. Choose **Windows** / **x64**, then run the downloaded `config.cmd` with the
   repository URL and the temporary token shown by GitHub.
4. Start it with `.\run.cmd` and leave the terminal open.
5. Confirm the runner shows **Idle** in GitHub, then push a commit to `main`.

The runner machine needs Docker Desktop running and the labels `self-hosted`,
`Windows`, and `X64` (GitHub adds these automatically on Windows).

## Verification performed on this machine

- `npm run build` — production bundle generated in `www/`.
- `npm run test:ci` — **7 test files, 19 tests passed**.
- `npm run lint` — all files pass.
- `npm run e2e:smoke` — real Chrome flow: create, search, update, delete,
  About tab, desktop layout. Screenshots are in
  [`docs/screenshots/`](docs/screenshots/).
- Docker build/run — Docker Desktop 4.99.0 + WSL2; image `ionic-crud:latest`
  (1,691,417,380 bytes), container `ionic-crud-container` healthy on
  `8100:8100`, and the browser CRUD smoke test passed against the container.
  See [`docs/LAB6-DOCKER-EVIDENCE.md`](docs/LAB6-DOCKER-EVIDENCE.md).
- CI/CD — run
  [43332501159](https://github.com/ahrongayutin02-cmyk/ite413-labs/actions/runs/43332501159)
  passed on commit `41e0208`: CI on `windows-latest` and CD on the self-hosted
  runner both green, new container healthy on port 8100, and the CRUD smoke
  test passed against the deployed container. Screenshots:
  [`12-github-actions-run.png`](docs/screenshots/12-github-actions-run.png),
  [`13-github-actions-cd-job.png`](docs/screenshots/13-github-actions-cd-job.png),
  [`14-cd-deployed-app.png`](docs/screenshots/14-cd-deployed-app.png).

## Project structure

```
src/app/
  models/menu-item.model.ts        data model + category taxonomy
  firebase.config.ts               config detection (placeholder vs real)
  services/menu-item.service.ts    Firestore + localStorage backends
  tab1/                            Create
  tab2/                            Read + search/filter + Update + Delete
  tab3/                            About, backend status, data tools
Dockerfile                         Lab 6 image
firebase.json / firestore.rules    deployable lab Firestore rules
.github/workflows/ci-cd.yml        CI/CD pipeline
docs/                              Firebase setup, Docker runbook, lab report
scripts/e2e-smoke.mjs              Playwright browser smoke test
scripts/verify-docker.ps1          Build/run/verify helper for Lab 6
```

## Troubleshooting

| Problem | Fix |
|---|---|
| App says "Local demo" after pasting config | Confirm `apiKey` and `projectId` no longer start with `YOUR_`, then restart `npm start`. |
| Firestore permission denied | Deploy the lab rules in `docs/FIREBASE_SETUP.md`; check the project id. |
| `npm ci` fails on Windows with a Rolldown binding error | Delete `node_modules` and `package-lock.json`, then `npm install`; the Windows binding is an optional dependency. |
| Port 8100 already in use | Stop the other dev server/container: `docker rm -f ionic-crud-container` or change the port in `package.json` and the workflow. |
| Runner stays queued | Start `.\run.cmd`; confirm the runner is Idle and its labels match `[self-hosted, Windows, X64]`. |
| CD cannot find Docker | Start Docker Desktop on the runner machine and confirm `docker info` works in the same shell. |
| `wsl --status` says virtualization is not enabled | Reboot after enabling the WSL feature, then check Task Manager → CPU → Virtualization. See `docs/DOCKER-RUNBOOK.md`. |
| Docker Desktop installer exits with code 1 | Check `%LOCALAPPDATA%\Docker\log\host\DockerDesktopInstaller-*.log`. The installer needs 3.27 GB free; free space and rerun elevated. |
