import { spawn, execSync } from "node:child_process";
import { startLidMonitor, stopLidMonitor } from "./lid";

/**
 * Tag used in `systemd-inhibit --who=` so we can find and stop only the
 * inhibitors we spawned (and survive across separate command invocations
 * of this extension — extensions are ephemeral, the inhibitor is not).
 */
const TAG = "vicinae-caffeinate";

export interface InhibitorStatus {
  active: boolean;
  pid?: number;
  /** Unix ms timestamp when the inhibitor will auto-expire. Undefined = indefinite. */
  endsAt?: number;
}

/** Check whether systemd-inhibit is available on this system. */
export function isSupported(): boolean {
  try {
    execSync("command -v systemd-inhibit", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Spawn a detached systemd-inhibit that keeps the system awake.
 * If durationSec is undefined, runs until manually stopped.
 *
 * We encode the end timestamp into --why so getStatus() can recover it
 * statelessly — no pidfile, no LocalStorage to keep in sync.
 */
export function startInhibitor(durationSec?: number): void {
  const endsAt = durationSec ? Date.now() + durationSec * 1000 : 0;
  const sleepCmd = durationSec ? `sleep ${durationSec}` : "sleep infinity";
  const why = endsAt ? `caffeinate:${endsAt}` : "caffeinate:indefinite";

  startLidMonitor();

  const child = spawn(
    "systemd-inhibit",
    [
      `--who=${TAG}`,
      `--why=${why}`,
      "--what=idle:sleep:handle-lid-switch",
      "sh",
      "-c",
      sleepCmd,
    ],
    { detached: true, stdio: "ignore" },
  );
  child.unref();
}

/* Kill any caffeinate inhibitors and the lid monitor we spawned. */
export function stopInhibitor(): void {
  stopLidMonitor();
  try {
    execSync(`pkill -f 'systemd-inhibit.*--who=${TAG}'`, { stdio: "ignore" });
  } catch {
    // pkill exits non-zero when nothing matches — that's fine.
  }
}

/* Check if a caffeinate inhibitor is currently running. */
export function getStatus(): InhibitorStatus {
  try {
    const out = execSync(`pgrep -af 'systemd-inhibit.*--who=${TAG}'`, {
      encoding: "utf-8",
    });
    const line = out.split("\n").find((l) => l.trim().length > 0);
    if (!line) return { active: false };

    const pidMatch = line.match(/^(\d+)/);
    const whyMatch = line.match(/--why=caffeinate:(\S+)/);
    const pid = pidMatch ? parseInt(pidMatch[1], 10) : undefined;
    const whyVal = whyMatch?.[1];

    let endsAt: number | undefined;
    if (whyVal && whyVal !== "indefinite") {
      const n = parseInt(whyVal, 10);
      if (!Number.isNaN(n)) endsAt = n;
    }

    return { active: true, pid, endsAt };
  } catch {
    return { active: false };
  }
}

export function formatRemaining(endsAt: number): string {
  const ms = endsAt - Date.now();
  if (ms <= 0) return "expiring…";
  const totalSec = Math.ceil(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m remaining`;
  if (m > 0) return `${m}m ${s}s remaining`;
  return `${s}s remaining`;
}
