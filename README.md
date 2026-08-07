# pi-dtime

English | [简体中文](./README-zh.md)

`pi-dtime` is a lightweight [Pi](https://github.com/earendil-works/pi) extension that appends the duration and local completion time after every fully settled agent response.

```text
本次回复耗时 4 秒 · 结束于 20:30:03
```

The rendered timing line currently uses Chinese text.

## Features

- Measures from the first `agent_start` until `agent_settled`, so automatic retries, compaction recovery, and queued continuation remain part of one complete run.
- Uses a monotonic clock for elapsed time, so wall-clock adjustments do not corrupt the duration.
- Records the local wall-clock completion time and includes the full date when a run crosses a local date boundary.
- Persists a TUI-only custom transcript entry without using the footer, status bar, or a live timer.
- Never calls `sendMessage`; timing entries are not added to later LLM context.
- Has zero runtime dependencies beyond Pi's bundled peer packages.

## Installation

Install the latest npm release:

```bash
pi install npm:pi-dtime
```

Install the pinned GitHub release:

```bash
pi install git:github.com/ssdiwu/pi-dtime@v0.1.0
```

Restart Pi after installation, or run `/reload` in an existing session.

## Development

```bash
git clone https://github.com/ssdiwu/pi-dtime.git
cd pi-dtime
npm install
npm run typecheck
npm test
npm pack --dry-run
```

To try the local checkout without installing it:

```bash
pi --no-extensions -e ./index.ts
```

The current tested compatibility baseline is `@earendil-works/pi-coding-agent` 0.84.1.

## Project layout

- `index.ts` — Pi extension entry point and complete timing implementation.
- `tests/` — extension registration and behavior regression tests.
- `doc/README.md` — documentation map and source-of-truth boundaries.
- `AGENTS.md` — implementation and verification constraints.

## Scope

`pi-dtime` measures only complete runs of the main Pi agent. It does not measure individual tool calls or independent `pi-dteam` workers.

## License

[MIT](./LICENSE)
