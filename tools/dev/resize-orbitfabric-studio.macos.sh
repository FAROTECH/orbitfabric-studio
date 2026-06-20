#!/usr/bin/env bash
set -euo pipefail

WIDTH="${1:-1440}"
HEIGHT="${2:-900}"

osascript <<EOF
tell application "System Events"
  set targetProcesses to every process whose name contains "OrbitFabric"
  if (count of targetProcesses) is 0 then
    error "OrbitFabric Studio window not found. Start npm run tauri:dev first."
  end if

  set targetProcess to item 1 of targetProcesses
  tell targetProcess
    if (count of windows) is 0 then
      error "OrbitFabric Studio process found, but no window is available."
    end if

    set position of window 1 to {40, 40}
    set size of window 1 to {$WIDTH, $HEIGHT}
  end tell
end tell
EOF

echo "OrbitFabric Studio resized to ${WIDTH}x${HEIGHT}"