# Lab 6 - Docker verification
# Builds the image, replaces the running container, waits for the app, and
# prints the details needed for the lab sheet.
#
# Run from the project root:
#   powershell -NoProfile -ExecutionPolicy Bypass -File scripts\verify-docker.ps1
# or:
#   scripts\verify-docker.cmd

[CmdletBinding()]
param(
    [string]$ImageName = 'ionic-crud',
    [string]$ContainerName = 'ionic-crud-container',
    [int]$Port = 8100,
    [switch]$SkipBuild,
    [switch]$SmokeTest
)

$ErrorActionPreference = 'Stop'

# Always build from the project root, even when the script is launched from
# Explorer or another directory.
$projectRoot = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path (Join-Path $projectRoot 'Dockerfile'))) {
    Write-Host "ERROR: Dockerfile not found in $projectRoot" -ForegroundColor Red
    exit 1
}
Set-Location $projectRoot

function Write-Step([string]$Message) {
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Stop-WithError([string]$Message) {
    Write-Host "ERROR: $Message" -ForegroundColor Red
    exit 1
}

Write-Step 'Checking Docker'
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Stop-WithError 'docker is not on PATH. Install and start Docker Desktop first.'
}

& docker info *> $null
if ($LASTEXITCODE -ne 0) {
    Stop-WithError 'The Docker daemon is not running. Start Docker Desktop and wait until it says "Engine running".'
}

if (-not $SkipBuild) {
    Write-Step "Building image '$ImageName' (first build can take 5-15 minutes)"
    & docker build -t $ImageName .
    if ($LASTEXITCODE -ne 0) {
        Stop-WithError 'docker build failed. Scroll up for the failing layer.'
    }
}

Write-Step "Replacing container '$ContainerName'"
& docker rm -f $ContainerName *> $null

Write-Step "Starting container on http://localhost:$Port/"
& docker run -d --name $ContainerName --restart unless-stopped -p "${Port}:8100" $ImageName
if ($LASTEXITCODE -ne 0) {
    Stop-WithError 'docker run failed.'
}

Write-Step 'Waiting for the Ionic dev server to compile (up to 3 minutes)'
$ready = $false
for ($i = 1; $i -le 60; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$Port/" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            $ready = $true
            break
        }
    } catch {
        # The server is still compiling; try again.
    }
    Start-Sleep -Seconds 3
}

if (-not $ready) {
    Write-Host 'Container logs:' -ForegroundColor Yellow
    & docker logs $ContainerName
    Stop-WithError "The app did not respond on port $Port within 3 minutes."
}

Write-Step 'Image details (copy these to the Lab 6 sheet)'
& docker images $ImageName

Write-Step 'Container status'
& docker ps --filter "name=$ContainerName"
& docker inspect --format 'Health={{if .State.Health}}{{.State.Health.Status}}{{else}}n/a{{end}} Image={{.Config.Image}} Started={{.State.StartedAt}}' $ContainerName

if ($SmokeTest) {
    Write-Step 'Running the browser CRUD smoke test against the container'
    & npm run e2e:smoke
    if ($LASTEXITCODE -ne 0) {
        Stop-WithError 'The browser smoke test failed.'
    }
}

Write-Host ""
Write-Host "Docker verification complete. Open http://localhost:$Port/ and take your screenshots." -ForegroundColor Green
Write-Host "Useful commands:"
Write-Host "  docker logs -f $ContainerName"
Write-Host "  docker stop $ContainerName"
Write-Host "  docker rm -f $ContainerName"
