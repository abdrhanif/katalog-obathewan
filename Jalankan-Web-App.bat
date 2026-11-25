@echo off
title Katalog Obat Hewan - Local Server
echo Memulai server lokal untuk Katalog Obat Hewan...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-server.ps1"
pause
