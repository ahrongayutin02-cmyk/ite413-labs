# Lab 6 — Docker runbook

This is the exact sequence to finish and verify the container lab on this
machine. The application code, `Dockerfile`, and CI/CD workflow are already
committed; the remaining work is the local Docker runtime.

## Current machine status (13 Nov 2026)

| Item | Status |
|---|---|
| `VirtualMachinePlatform` | Enabled |
| `Microsoft-Windows-Subsystem-Linux` | Enabled on 13 Nov 2026 — **reboot required** |
| WSL2 kernel / distro | Starts after the reboot |
| Docker Desktop 4.99.0 | Installed on 13 Nov 2026 (installer exit code 0) |
| Free disk space | 5.79 GB |
| Next action | Reboot Windows, then run `scripts\verify-docker.cmd -SmokeTest` |

The Docker Desktop installer has already run successfully and was deleted to
recover 624 MB. `C:\Program Files\Docker\Docker\Docker Desktop.exe` exists and
the `com.docker.service` service is registered. WSL2 still needs the reboot
before the Linux engine can start.

If Docker Desktop ever needs to be reinstalled, download the current installer
from <https://www.docker.com/products/docker-desktop/> and run it elevated:

```powershell
Start-Process "$env:TEMP\DockerDesktopInstaller.exe" `
  -ArgumentList 'install','--quiet','--accept-license','--backend=wsl-2' `
  -Verb RunAs -Wait
```

## 1. Reboot Windows

WSL2 cannot start until the optional feature is active. Save your work and
restart the machine. After signing back in:

```powershell
wsl --status
wsl --update
```

`wsl --status` should report **Default Version: 2** without the
"virtualization is not enabled" warning. If it still warns, open **Task Manager
→ Performance → CPU** and confirm **Virtualization: Enabled**. If firmware
virtualization is off, enable Intel VT-x / AMD-V in BIOS/UEFI.

## 2. Start Docker Desktop

1. Open **Docker Desktop** from the Start menu.
2. Accept the license and skip the sign-in (a Docker Hub account is not needed
   for this lab).
3. Wait until the dashboard says **Engine running**.
4. Verify from PowerShell:

```powershell
docker version
docker info
```

If Docker Desktop offers a WSL2 kernel update, accept it. A second reboot may be
required.

## 3. Build and run the app

From the project root:

```powershell
cd C:\Users\axelj\dev\ite413-labs\user-crud
scripts\verify-docker.cmd
```

The script builds the image, replaces the old container, waits for the Ionic dev
server, and prints the image/container details. Add `-SmokeTest` to run the
browser CRUD test against the container:

```powershell
scripts\verify-docker.cmd -SmokeTest
```

Manual equivalent:

```powershell
docker build -t ionic-crud .
docker images
docker run -d --name ionic-crud-container -p 8100:8100 ionic-crud
docker ps
docker logs ionic-crud-container
```

Open <http://localhost:8100>. The first request can take 1–2 minutes while
Angular compiles; the `HEALTHCHECK` has a 120-second start period for this
reason.

## 4. Record these values for the lab sheet

Run:

```powershell
docker images ionic-crud
docker ps --filter "name=ionic-crud-container"
docker inspect --format "ID={{.Id}} Image={{.Config.Image}} Status={{.State.Status}} Health={{if .State.Health}}{{.State.Health.Status}}{{else}}n/a{{end}}" ionic-crud-container
docker image inspect ionic-crud --format "ID={{.Id}} Size={{.Size}}"
```

| Field | Value |
|---|---|
| Image name / tag | `ionic-crud:latest` |
| Image ID | |
| Image size (bytes / MB) | |
| Container name | `ionic-crud-container` |
| Container ID | |
| Host port → container port | `8100 → 8100` |
| Container status | |
| Health status | |
| `docker build` duration | |
| `docker run` / first response duration | |

Screenshots to add to the submission:

1. Docker Desktop **Containers** view showing `ionic-crud-container` running.
2. Terminal showing the successful `docker build` and `docker images`.
3. Terminal showing `docker ps` with the port mapping.
4. Browser at <http://localhost:8100> with the app loaded.
5. The CRUD flow inside the container (add, edit, delete).

## 5. Container lifecycle commands

```powershell
docker stop ionic-crud-container     # stop
docker ps -a                         # show stopped container
docker start ionic-crud-container    # start again
docker logs -f ionic-crud-container  # follow logs
docker rm -f ionic-crud-container    # remove container
docker images                        # image remains
docker rmi ionic-crud                # remove image when finished
```

Removing the container does not remove the image and does not delete Firestore
records. Cloud data lives outside the container.

## 6. Troubleshooting

| Symptom | Fix |
|---|---|
| `docker info` cannot connect | Start Docker Desktop and wait for **Engine running**; run the command in a new terminal. |
| `wsl --status` says virtualization is not enabled | Reboot first. Then check Task Manager → CPU → Virtualization; enable VT-x/AMD-V in BIOS if it is off. |
| `WSL 2 requires an update to its kernel component` | Run `wsl --update` as administrator, then restart Docker Desktop. |
| Port 8100 already in use | Stop the host dev server (`Ctrl+C` in its terminal) or run `netstat -ano | findstr :8100`, then `taskkill /PID <pid> /F`. |
| `npm ci` fails inside the build | Run `docker build --no-cache -t ionic-crud .` and read the first error. The lockfile and optional Rolldown binding are already configured for Linux. |
| App does not load, container restarts | `docker logs ionic-crud-container`; the dev server needs 1–2 minutes on a cold start. |
| Build runs out of disk space | `docker system df`, then free space or `docker system prune -f` (only if no other project needs the cache). |
| Docker Desktop installer exits with code 1 | Read `%LOCALAPPDATA%\Docker\log\host\DockerDesktopInstaller-*.log`. The 13 Nov failure was disk space: the installer needs 3.27 GB free. Free space, then rerun the elevated install command above. |

## 7. Cleanup

When the lab is finished and the screenshots are saved:

```powershell
docker rm -f ionic-crud-container
docker rmi ionic-crud
```

Do **not** run `docker system prune -a` on a shared machine; it deletes every
unused image, container, and build cache.
