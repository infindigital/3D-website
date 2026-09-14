#!/usr/bin/env bash
# RS Chef'z — local preview (macOS / Linux).
#
# macOS: double-click this file. If macOS refuses the first time, right-click
#        it and choose Open, then Open again on the warning.
# Linux: run  ./preview-MAC-LINUX.command  from a terminal.
#
# Finds Node or Python, whichever you have, and starts the preview.

cd "$(dirname "$0")" || exit 1

if command -v node >/dev/null 2>&1; then
  echo "Starting preview with Node..."
  exec node preview-server.mjs
fi

if command -v python3 >/dev/null 2>&1; then
  echo "Starting preview with Python..."
  exec python3 preview-server.py
fi

if command -v python >/dev/null 2>&1; then
  echo "Starting preview with Python..."
  exec python preview-server.py
fi

cat <<'MSG'

  Neither Node.js nor Python was found on this computer.

  macOS already ships Python 3 on current versions; if this message
  appeared, install either one and run this again:

    Node.js  -  https://nodejs.org  (pick the LTS button)
    Python   -  https://python.org/downloads

MSG
read -r -p "Press Enter to close."
