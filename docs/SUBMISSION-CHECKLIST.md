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
- [x] GitHub Actions CI/CD workflow with Windows hosted CI and self-hosted CD.
- [x] Deployable lab Firestore rules (`firebase.json`, `firestore.rules`).
- [x] Unit tests: 7 files / 19 tests passing.
- [x] Lint passing.
- [x] Production build passing.
- [x] Real-browser CRUD smoke test passing, with screenshots in `docs/screenshots/`.
- [x] Lab report, Firebase setup guide, and Docker runbook.

## Needs your account / machine (cannot be completed by an agent)

- [ ] **Firebase project** — create it, paste the web config into
      `src/environments/environment.ts` (and `.prod.ts` for a production
      build), deploy the rules in `firestore.rules`, then take the
      Firestore-mode screenshots. See `docs/FIREBASE_SETUP.md`.
- [ ] **Docker Desktop** — 4.99.0 is installed (exit code 0); WSL2 features are
      enabled. **Reboot Windows**, start Docker Desktop, then run
      `scripts\verify-docker.cmd -SmokeTest`. Record the image
      name/tag/id/size and take the screenshots listed in
      `docs/DOCKER-RUNBOOK.md`.
- [ ] **GitHub repository** — create a repo, push `main`, and confirm the CI job
      passes in the Actions tab.
- [ ] **Self-hosted runner** — register it on the repository
      (Settings → Actions → Runners), start `.\run.cmd`, confirm it is Idle with
      labels `self-hosted`, `Windows`, `X64`.
- [ ] **CD verification** — push a visible change to `main`, watch CI then CD,
      refresh <http://localhost:8100>, and screenshot the updated app.
- [ ] **Lab sheet answers** — record the Docker image details, the workflow run
      URLs, and the runner name in your submission.

## Suggested commit sequence

```bash
git add .
git commit -m "feat(lab4): Ionic tabs CRUD with MenuItem model and Firebase"
git commit -m "feat(lab6): add Dockerfile and container instructions"
git commit -m "ci: add Windows CI and self-hosted Docker deployment"
git push -u origin main
```
