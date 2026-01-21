@echo off
chcp 65001 > nul
cd /d "%~dp0"
cls
echo ============================================
echo   SHINE CAR DETAILING podglad
echo ============================================
echo.
echo Folder: %CD%
echo.
echo Uruchamianie serwera...
echo.
echo Otworz w przegladarce:
echo   http://localhost:8000
echo.
echo Aby zatrzymac, zamknij to okno lub CTRL+C
echo ============================================
echo.

python -m http.server 8000

pause
