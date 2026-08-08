# pi-dtime

English | [简体中文](./README-zh.md)

`pi-dtime` is a lightweight [Pi](https://github.com/earendil-works/pi) extension that appends the duration and local completion time after every fully settled agent response.

```text
中文：本次回复耗时 4 秒 · 结束于 20:30:03
English: Response took 4 seconds · Finished at 20:30:03
日本語：今回の応答時間 4 秒 · 完了時刻 20:30:03
```

## Features

- Measures from the first `agent_start` until `agent_settled`, so automatic retries, compaction recovery, and queued continuation remain part of one complete run.
- Uses a monotonic clock for elapsed time, so wall-clock adjustments do not corrupt the duration.
- Records the local wall-clock completion time and includes the full date when a run crosses a local date boundary.
- Optionally follows the active [`pi-di18n`](https://github.com/ssdiwu/pi-di18n) `/lang` locale for copy, duration units, and date/time formatting.
- Re-renders historical `response-timing` entries in the current locale without changing the persisted v1 data contract.
- Persists a TUI-only custom transcript entry without using the footer, status bar, or a live timer.
- Never calls `sendMessage`; timing entries are not added to later LLM context.
- Has zero runtime dependencies beyond Pi's bundled peer packages.

## Installation

Install the latest npm release:

```bash
pi install npm:pi-dtime
```

To make timing lines follow `/lang`, install both packages:

```bash
pi install npm:pi-di18n
pi install npm:pi-dtime
```

Install the pinned GitHub release:

```bash
pi install git:github.com/ssdiwu/pi-dtime@v0.2.0
```

Restart Pi after installation, or run `/reload` in an existing session.

## Localization behavior

When `pi-di18n` is available, `pi-dtime` connects through the public `pi-core/i18n/requestApi` contract and reads the current locale at render time. Changing `/lang` and reloading therefore updates both new and existing timing entries.

The maintained locale set matches the 25 TUI locales currently shipped by `pi-di18n`: `cs`, `da`, `de`, `el`, `en`, `es`, `fi`, `fr`, `hi`, `id`, `it`, `ja`, `ko`, `nl`, `pl`, `pt-BR`, `pt-PT`, `ro`, `sg`, `sv`, `tr`, `uk`, `vi`, `zh-CN`, and `zh-TW`.

If `pi-di18n` is absent or its API is unavailable, `pi-dtime` remains fully functional and uses Simplified Chinese. Unknown valid locales follow the i18n fallback and default to English.

## Development

```bash
git clone https://github.com/ssdiwu/pi-dtime.git
cd pi-dtime
npm install
npm run typecheck
npm test
npm pack --dry-run
```

To try the local checkout without installed extensions:

```bash
pi --no-extensions -e ./index.ts
```

The current tested compatibility baseline is `@earendil-works/pi-coding-agent` 0.84.1. Localization integration targets the `pi.i18n.v1` contract exposed by `pi-di18n`.

## Project layout

- `index.ts` — Pi extension entry point, timing lifecycle, and optional i18n bridge.
- `src/locales.ts` — locale messages, bundle metadata, aliases, and fallback rules.
- `tests/` — extension registration, localization, and behavior regression tests.
- `doc/README.md` — documentation map and source-of-truth boundaries.
- `AGENTS.md` — implementation and verification constraints.

## Scope

`pi-dtime` measures only complete runs of the main Pi agent. It does not measure individual tool calls or independent `pi-dteam` workers.

## License

[MIT](./LICENSE)
