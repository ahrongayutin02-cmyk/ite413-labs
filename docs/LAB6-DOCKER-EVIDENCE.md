# Lab 6 — Docker verification evidence

Captured on **13 Nov 2026** on `AXELJOSH` after the WSL2 reboot.

> **Update after the CI/CD deployment (run `43332501159`).** The self-hosted
> runner rebuilt and replaced the container, so the current deployment is:
> image `sha256:d5ac7f68571ed6997d0b627e9f731a678d060371a88a80238097e3d20d3d61b9`,
> container `785f1fa3c60ea2ec4c632eed99f74c184c33e7288bff944927e01f45db886dca`,
> started `2026-11-12T23:55:51Z`, healthy, HTTP 200 on port 8100. The values
> below document the earlier local Lab 6 build; both used the same Dockerfile.

## Environment

| Item | Value |
|---|---|
| Docker Desktop | 4.99.0 |
| Docker engine | 29.9.3 |
| WSL default version | 2 |
| Project | `C:\Users\axelj\dev\ite413-labs\user-crud` |
| Host URL | <http://localhost:8100> |

## Build summary

Command:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\verify-docker.ps1
```

The cold build completed the image export. Docker then returned
`failed to receive status: ... EOF` because the virtual disk had filled to
0 bytes free. The image was already present, so the build cache was pruned and
the container was verified with `-SkipBuild` (no rebuild):

| Stage | Time |
|---|---|
| Pull/extract `node:22-alpine` | 244.7 s |
| Install `@ionic/cli` | 75.8 s |
| `npm ci` (527 packages) | 550.2 s |
| Export/unpack image | 90.8 s |
| **Total** | **~16 minutes** |

`npm ci` printed `EBADENGINE` warnings because Firebase 13 declares Node
`>=24.12` while the lab manual requires Node 22 Alpine. They are warnings only:
the image built, the container became healthy, and the CRUD test passed.

Image export line:

```text
#11 naming to docker.io/library/ionic-crud:latest
#11 unpacking to docker.io/library/ionic-crud:latest 86.3s done
```

## Image details

```text
$ docker images
IMAGE               ID             DISK USAGE   CONTENT SIZE   EXTRA
ionic-crud:latest   76354fb7b178        1.69GB          378MB   U
```

```text
$ docker image inspect ionic-crud --format "ID={{.Id}} Size={{.Size}} bytes Created={{.Created}}"
ID=sha256:76354fb7b178f7c913f72d09c609d4acf1f7ac30457312563b3dbf3a76429c12
Size=1691417380 bytes
Created=2026-11-12T18:13:16.836144865Z
```

`docker images` reports **1.69 GB disk usage** (the image plus the running
container's writable layer) and **378 MB content size**. The image's own
inspect size is **1,691,417,380 bytes (1.69 GB)**.

## Container details

```text
$ docker ps --filter "name=ionic-crud-container"
CONTAINER ID   IMAGE        COMMAND                  CREATED          STATUS                   PORTS                                         NAMES
13d0458f8317   ionic-crud   "docker-entrypoint.s…"   3 minutes ago    Up 3 minutes (healthy)   0.0.0.0:8100->8100/tcp, [::]:8100->8100/tcp   ionic-crud-container
```

```text
$ docker inspect --format "ID={{.Id}}`nImage={{.Config.Image}}`nImageID={{.Image}}`nStatus={{.State.Status}}`nHealth={{if .State.Health}}{{.State.Health.Status}}{{else}}n/a{{end}}`nStarted={{.State.StartedAt}}`nPorts={{json .NetworkSettings.Ports}}" ionic-crud-container
ID=13d0458f8317a4649c6257122df8604d5c5e020aa58bb6d9466371f5aea44da2
Image=ionic-crud
ImageID=sha256:76354fb7b178f7c913f72d09c609d4acf1f7ac30457312563b3dbf3a76429c12
Status=running
Health=healthy
Started=2026-11-12T18:25:34.578012394Z
Ports={"8100/tcp":[{"HostIp":"0.0.0.0","HostPort":"8100"},{"HostIp":"::","HostPort":"8100"}]}
```

## Health and HTTP checks

```text
$ docker inspect --format "{{range .State.Health.Log}}{{.Start}} exit={{.ExitCode}} {{.Output}}{{end}}" ionic-crud-container
2026-11-12 18:26:39 +0000 UTC exit=0
2026-11-12 18:27:10 +0000 UTC exit=0
2026-11-12 18:27:40 +0000 UTC exit=0
2026-11-12 18:28:10 +0000 UTC exit=0
2026-11-12 18:28:40 +0000 UTC exit=0
```

```text
$ Invoke-WebRequest http://localhost:8100/ -UseBasicParsing
HTTP 200 length=873
```

The container started at `18:25:34 UTC` and passed its first health check at
`18:26:39 UTC` — about **65 seconds** to become healthy.

## Browser smoke test

```text
$ npm run e2e:smoke
screenshot: docs/screenshots/01-add-form.png
screenshot: docs/screenshots/02-add-form-filled.png
screenshot: docs/screenshots/03-item-added.png
screenshot: docs/screenshots/04-items-list.png
screenshot: docs/screenshots/05-edit-modal.png
screenshot: docs/screenshots/06-item-updated.png
screenshot: docs/screenshots/07-delete-slide.png
screenshot: docs/screenshots/08-about.png
screenshot: docs/screenshots/09-items-desktop.png
CRUD smoke test passed: create, read, search, update, delete.
```

The screenshots in `docs/screenshots/` were regenerated against the container,
so they show the app served from `ionic-crud-container`, not the host dev
server.

## Lab sheet values

| Field | Value |
|---|---|
| Image name / tag | `ionic-crud:latest` |
| Image ID | `sha256:76354fb7b178f7c913f72d09c609d4acf1f7ac30457312563b3dbf3a76429c12` |
| Image size | 1,691,417,380 bytes (1.69 GB disk usage / 378 MB content) |
| Container name | `ionic-crud-container` |
| Container ID | `13d0458f8317a4649c6257122df8604d5c5e020aa58bb6d9466371f5aea44da2` |
| Host port → container port | `8100 → 8100` |
| Container status | `Up (healthy)` |
| Health status | `healthy` (5 consecutive exit 0) |
| `docker build` duration | ~16 minutes |
| `docker run` / first response | ~65 seconds to healthy |
