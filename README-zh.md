# pi-dtime

[English](./README.md) | 简体中文

`pi-dtime` 是一个轻量的 [Pi](https://github.com/earendil-works/pi) 扩展：每次 Agent 完整结束后，在对话末尾追加本次回复耗时与本地结束时间。

```text
本次回复耗时 4 秒 · 结束于 20:30:03
```

## 功能

- 从首次 `agent_start` 计时到 `agent_settled`，自动重试、压缩恢复和排队续跑都计入同一次完整运行。
- 使用单调时钟计算回复耗时，系统墙上时钟向前或向后校准都不会破坏计时记录。
- 使用本地墙上时钟记录结束时刻；运行跨过本地日期时自动显示完整日期。
- 通过仅供 TUI 显示的 custom entry 保存记录，不占用底栏、状态栏或常驻计时器。
- 不调用 `sendMessage`，计时记录不会进入后续 LLM 上下文。
- 除 Pi 自带的 peer package 外没有运行时依赖。

## 安装

安装最新 npm 版本：

```bash
pi install npm:pi-dtime
```

安装固定的 GitHub 版本：

```bash
pi install git:github.com/ssdiwu/pi-dtime@v0.1.0
```

安装后重启 Pi，或在现有会话中执行 `/reload`。

## 开发

```bash
git clone https://github.com/ssdiwu/pi-dtime.git
cd pi-dtime
npm install
npm run typecheck
npm test
npm pack --dry-run
```

不安装、直接试运行本地代码：

```bash
pi --no-extensions -e ./index.ts
```

当前经过验证的兼容基线为 `@earendil-works/pi-coding-agent` 0.84.1。

## 目录

- `index.ts`：Pi 扩展入口与完整计时实现。
- `tests/`：扩展注册及行为回归测试。
- `doc/README.md`：文档阅读顺序与权威边界。
- `AGENTS.md`：项目实现与验证约束。

## 范围

`pi-dtime` 只记录主 Pi Agent 的完整回复运行，不统计单个工具调用或独立 `pi-dteam` worker 的耗时。

## 许可证

[MIT](./LICENSE)
