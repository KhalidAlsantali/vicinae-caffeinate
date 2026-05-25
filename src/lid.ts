import { spawn, execSync } from "node:child_process";
import { readdirSync } from "node:fs";

const LID_TAG = "vicinae-caffeinate-lid";

function findLidPath(): string | null {
  try {
    const entries = readdirSync("/proc/acpi/button/lid");
    if (entries.length > 0) {
      return `/proc/acpi/button/lid/${entries[0]}/state`;
    }
  } catch {}
  return null;
}

/**
 * Spawn a detached shell that polls the ACPI lid state every second and
 * turns displays off/on via kscreen-doctor, powerdevil D-Bus, or xset
 * (tried in that order). Identified by LID_TAG so it can be pkill'd.
 */
export function startLidMonitor(): void {
  stopLidMonitor();

  const lidPath = findLidPath();
  if (!lidPath) return;

  const script = `
PREV=""
dpms_off() {
  kscreen-doctor --dpms off 2>/dev/null && return
  xset dpms force off 2>/dev/null || true
}
dpms_on() {
  kscreen-doctor --dpms on 2>/dev/null && return
  xset dpms force on 2>/dev/null || true
}
while true; do
  S=$(cat "${lidPath}" 2>/dev/null)
  if [ "$S" != "$PREV" ]; then
    case "$S" in
      *closed*) dpms_off ;;
      *open*)   [ -n "$PREV" ] && dpms_on ;;
    esac
    PREV="$S"
  fi
  sleep 1
done
`.trim();

  const child = spawn("sh", ["-c", `# ${LID_TAG}\n${script}`], {
    detached: true,
    stdio: "ignore",
  });
  child.unref();
}

export function stopLidMonitor(): void {
  try {
    execSync(`pkill -f '${LID_TAG}'`, { stdio: "ignore" });
  } catch {}
}
