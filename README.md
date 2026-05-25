# Caffeinate

A [Vicinae](https://vicinae.app) extension that keeps your Linux system awake on demand using `systemd-inhibit`.

## Commands

- **Caffeinate** — opens a UI to view current status and enable caffeination for a preset duration (30 min, 1h, 2h, 4h, 8h, or indefinitely)
- **Toggle Caffeinate** — quick no-UI toggle for use via hotkey

## Requirements

- Linux with systemd (`systemd-inhibit` in `PATH`)
- `kscreen-doctor` for lid-close display blanking on KDE (falls back to `xset` on X11)

## Installation

### 1. Install Vicinae

Download and install [Vicinae](https://vicinae.app) for Linux.

### 2. Install the extension

```sh
git clone https://github.com/KhalidAlsantali/vicinae-caffeinate
cd vicinae-caffeinate
npm install
npm run build
```

## How it works

Spawns two detached processes that survive across extension invocations:

- **`systemd-inhibit --what=sleep:handle-lid-switch`** — blocks all sleep (idle timeout, explicit suspend, etc.) and prevents logind from acting on lid close, so the system stays awake and the session never locks.
- **Lid monitor** — polls `/proc/acpi/button/lid/*/state` and calls `kscreen-doctor --dpms off/on` when the lid closes or opens, so the display still blanks on lid close despite the inhibitor.

The inhibitor's end timestamp is encoded in its `--why` field and recovered via `pgrep`, so no pidfile is needed.

## Attribution

Extension icon uses [Twemoji](https://github.com/twitter/twemoji) graphics © Twitter, Inc., licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
