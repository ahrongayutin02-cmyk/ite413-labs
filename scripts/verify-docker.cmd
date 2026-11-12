@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0verify-docker.ps1" %*
