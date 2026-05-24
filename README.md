# Caffeinate

A [Vicinae](https://vicinae.app) extension that keeps your Linux system awake on demand using `systemd-inhibit`.

## Commands

- **Caffeinate** — opens a UI to view current status and enable caffeination for a preset duration (30 min, 1h, 2h, 4h, 8h, or indefinitely)
- **Toggle Caffeinate** — quick no-UI toggle for use via hotkey

## Requirements

- Linux with systemd (`systemd-inhibit` in `PATH`)

## Installation

### 1. Install Vicinae

Download and install [Vicinae](https://vicinae.app) for Linux.wddqw

### 2. Install the extension

```sh
git clone https://github.com/KhalidAlsantali/vicinae-caffeinate
cd vicinae-caffeinate
npm install
npm run build
```

## How it works

Spawns a detached `systemd-inhibit` process that blocks idle, sleep, and lid-switch events. The inhibitor survives across extension invocations — no pidfile needed, since the end timestamp is encoded in the inhibitor's `--why` field and recovered via `pgrep`.

## Attribution

Extension icon uses [Twemoji](https://github.com/twitter/twemoji) graphics © Twitter, Inc., licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
