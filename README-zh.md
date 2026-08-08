# pi-dtime

[English](./README.md) | 简体中文

`pi-dtime` 是一个轻量的 [Pi](https://github.com/earendil-works/pi) 扩展：每次 Agent 完整结束后，在对话末尾追加本次回复耗时与本地结束时间。

```text
中文：本次回复耗时 4 秒 · 结束于 20:30:03
English: Response took 4 seconds · Finished at 20:30:03
日本語：今回の応答時間 4 秒 · 完了時刻 20:30:03
```

## 功能

- 从首次 `agent_start` 计时到 `agent_settled`，自动重试、压缩恢复和排队续跑都计入同一次完整运行。
- 使用单调时钟计算回复耗时，系统墙上时钟向前或向后校准都不会破坏计时记录。
- 使用本地墙上时钟记录结束时刻；运行跨过本地日期时自动显示完整日期。
- 可选跟随 [`pi-di18n`](https://github.com/ssdiwu/pi-di18n) 当前 `/lang` 语言，本地化文案、时长单位与日期时间格式。
- 历史 `response-timing` 记录也会按当前语言重新渲染，同时保持 v1 持久化契约不变。
- 通过仅供 TUI 显示的 custom entry 保存记录，不占用底栏、状态栏或常驻计时器。
- 不调用 `sendMessage`，计时记录不会进入后续 LLM 上下文。
- 除 Pi 自带的 peer package 外没有运行时依赖。

## 安装

安装最新 npm 版本：

```bash
pi install npm:pi-dtime
```

如需计时行跟随 `/lang`，请同时安装两个包：

```bash
pi install npm:pi-di18n
pi install npm:pi-dtime
```

安装固定的 GitHub 版本：

```bash
pi install git:github.com/ssdiwu/pi-dtime@v0.2.0
```

安装后重启 Pi，或在现有会话中执行 `/reload`。

## 本地化行为

存在 `pi-di18n` 时，`pi-dtime` 通过公开的 `pi-core/i18n/requestApi` 契约连接，并在每次渲染时读取当前语言。因此切换 `/lang` 并重新加载后，新旧计时记录都会更新语言。

当前维护的语言集合与 `pi-di18n` 的 25 个 TUI locale 一致：`cs`、`da`、`de`、`el`、`en`、`es`、`fi`、`fr`、`hi`、`id`、`it`、`ja`、`ko`、`nl`、`pl`、`pt-BR`、`pt-PT`、`ro`、`sg`、`sv`、`tr`、`uk`、`vi`、`zh-CN` 和 `zh-TW`。

未安装 `pi-di18n` 或其 API 不可用时，`pi-dtime` 仍可独立运行，并默认使用简体中文。有效但未维护的语言会遵循 i18n 回退，最终默认使用英文。

## 开发

```bash
git clone https://github.com/ssdiwu/pi-dtime.git
cd pi-dtime
npm install
npm run typecheck
npm test
npm pack --dry-run
```

不加载已安装扩展、直接试运行本地代码：

```bash
pi --no-extensions -e ./index.ts
```

当前经过验证的兼容基线为 `@earendil-works/pi-coding-agent` 0.84.1。本地化集成面向 `pi-di18n` 暴露的 `pi.i18n.v1` 契约。

## 目录

- `index.ts`：Pi 扩展入口、计时生命周期与可选 i18n 桥接。
- `src/locales.ts`：多语言文案、bundle 元数据、别名与回退规则。
- `tests/`：扩展注册、本地化与行为回归测试。
- `doc/README.md`：文档阅读顺序与权威边界。
- `AGENTS.md`：项目实现与验证约束。

## 范围

`pi-dtime` 只记录主 Pi Agent 的完整回复运行，不统计单个工具调用或独立 `pi-dteam` worker 的耗时。

## 许可证

[MIT](./LICENSE)
