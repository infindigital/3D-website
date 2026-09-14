@echo off
REM RS Chef'z - local preview (Windows). Double-click this file.
REM Finds Node or Python, whichever you have, and starts the preview.
setlocal
cd /d "%~dp0"

where node >/dev/null 2>nul
if %errorlevel%==0 (
  echo Starting preview with Node...
  node preview-server.mjs
  goto done
)

where py >/dev/null 2>nul
if %errorlevel%==0 (
  echo Starting preview with Python...
  py preview-server.py
  goto done
)

where python >/dev/null 2>nul
if %errorlevel%==0 (
  echo Starting preview with Python...
  python preview-server.py
  goto done
)

echo.
echo   Neither Node.js nor Python was found on this computer.
echo.
echo   Install either one, then double-click this file again:
echo     Node.js  -  https://nodejs.org  (pick the LTS button)
echo     Python   -  https://python.org/downloads
echo.
echo   During the Python installer, tick "Add Python to PATH".
echo.
pause

:done
pause
