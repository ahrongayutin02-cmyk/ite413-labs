# Submission checklist

## Already done and verified

- [x] Ionic Angular Tabs project created (`user-crud`).
- [x] Custom **MenuItem** data model with typed fields and validation.
- [x] Create form on Tab 1 (`ion-input`, `ion-select`, `ion-textarea`, `ion-toggle`).
- [x] Read list on Tab 2 with live updates, search, category filter, count, badges.
- [x] Update modal with validation.
- [x] Delete via swipe (`ion-item-sliding`) and delete-all confirmation.
- [x] `ion-toast`, `ion-loading`, `ion-refresher`, empty state.
- [x] Firebase Firestore service using the modular SDK v9+ (`onSnapshot`,
      `addDoc`, `updateDoc`, `deleteDoc`).
- [x] localStorage demo fallback so the app runs before Firebase is connected.
- [x] `Dockerfile` (Node 22 Alpine, port 8100) and `.dockerignore`.
- [x] Docker build/run helper: `scripts/verify-docker.ps1` / `.cmd`.
- [x] Docker Desktop 4.99.0 + WSL2 active; image `ionic-crud:latest` built,
      container `ionic-crud-container` healthy, browser CRUD smoke test passed.
      Details: `docs/LAB6-DOCKER-EVIDENCE.md`.
- [x] GitHub Actions CI/CD workflow with Windows hosted CI and self-hosted CD.
- [x] Firestore database `(default)` created in `serverlena`
      (Firestore Native, `asia-southeast1`) and `firestore.rules` deployed.
- [x] Real Firebase web config committed in `environment.ts` / `environment.prod.ts`.
- [x] GitHub repository <https://github.com/ahrongayutin02-cmyk/ite413-labs>
      created and `main` pushed.
- [x] Self-hosted runner `axeljosh-lab6-runner` online (Idle), labels
      `self-hosted`, `Windows`, `X64`.
- [x] CD pipeline passed and deployed the container; evidence in
      `docs/screenshots/12-github-actions-run.png`,
      `13-github-actions-cd-job.png`, and `14-cd-deployed-app.png`.
- [x] Unit tests: 7 files / 19 tests passing.
- [x] Lint passing.
- [x] Production build passing.
- [x] Real-browser CRUD smoke test passing, with screenshots in `docs/screenshots/`.
- [x] Lab report, Firebase setup guide, and Docker runbook.

## Remaining manual items

- [ ] **Docker Desktop screenshot** (only if the instructor requires a GUI
      screenshot): open Docker Desktop's **Containers** view and capture the
      screen listed in `docs/DOCKER-RUNBOOK.md`. The runtime itself is verified.
- [ ] **Lab sheet answers** — Docker values are in
      `docs/LAB6-DOCKER-EVIDENCE.md`; workflow run URLs and the runner name are in
      `docs/LAB-REPORT.md` → CI/CD.

## Key commits on `main`

```text
41e0208 fix(ui): refresh async Firestore state in zoneless change detection
9131919 ci: use Windows PowerShell on the self-hosted runner
a75f8ab ci: wait for container health before verifying the deployment
82934ea feat(firebase): connect Lab 4 to the serverlena web app config
8da3bef feat: complete ITE 413 Lab 4, Lab 6, and CI/CD pipeline
```

Earlier commits add the Docker runbook, Docker verification evidence, and the
local demo-backend fixes. The repository is already pushed; no further commit
sequence is required.
