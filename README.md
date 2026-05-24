# Caffeinate

A [Vicinae](https://vicinae.app) extension that keeps your Linux system awake on demand using `systemd-inhibit`.

## Commands

- **Caffeinate** — opens a UI to view current status and enable caffeination for a preset duration (30 min, 1h, 2h, 4h, 8h, or indefinitely)
- **Toggle Caffeinate** — quick no-UI toggle for use via hotkey

## Requirements

- Linux with systemd (`systemd-inhibit` in `PATH`)

## How it works

Spawns a detached `systemd-inhibit` process that blocks idle, sleep, and lid-switch events. The inhibitor survives across extension invocations — no pidfile needed, since the end timestamp is encoded in the inhibitor's `--why` field and recovered via `pgrep`.

## Development

```sh
npm install
npm run dev   # develop with live reload
npm run build # production build
npm run lint
```

## Attribution

Extension icon uses [Twemoji](https://github.com/twitter/twemoji) graphics © Twitter, Inc., licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
