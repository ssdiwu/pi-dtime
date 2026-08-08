# Changelog

本项目遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 Semantic Versioning。

## [Unreleased]

## [0.2.0] - 2026-08-08

### Added

- 可选接入 `pi-di18n` 的 `pi.i18n.v1` API，使计时文案跟随当前 `/lang` 语言。
- 覆盖 `pi-di18n` 当前维护的 25 个 TUI locale，并通过 `Intl` 本地化时长单位与日期时间。

### Changed

- 历史 `response-timing` v1 记录按当前语言动态重绘；未安装或无法连接 `pi-di18n` 时继续默认使用简体中文。

## [0.1.0] - 2026-08-08

### Added

- 在每次 Pi Agent 完整回复后追加回复耗时与本地结束时间。
- 通过 TUI-only custom entry 保存记录，不占用底栏或模型上下文。

### Fixed

- 系统墙上时钟向后校准时，仍生成可验证、可渲染的准确耗时记录。

[Unreleased]: https://github.com/ssdiwu/pi-dtime/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/ssdiwu/pi-dtime/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/ssdiwu/pi-dtime/releases/tag/v0.1.0
