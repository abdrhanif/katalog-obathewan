@echo off
title Deploy Katalog Obat Hewan ke Firebase Hosting
echo ========================================================
echo  Mempersiapkan Deploy ke https://katalog-obathewan.web.app
echo ========================================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy-to-firebase.ps1"
echo.
pause
