# pi-dtime Agent 规范

## 项目定位

`pi-dtime` 是 Pi 的回复完成计时扩展：每次主 Agent 完整 settled 后，在对话末尾追加本次耗时与本地结束时间。

## 阅读顺序

1. `README.md` 与 `README-zh.md`：英文、中文用户行为与安装入口，两者内容必须同步。
2. `doc/README.md`：文档权威边界。
3. `index.ts`：当前实现权威。
4. `tests/README.md` 与 `tests/index.test.ts`：行为验证。
5. `CHANGELOG.md`：用户可感知变化，不作为当前实现权威。

## 行为与安全边界

- 计时边界固定为首次 `agent_start` 到 `agent_settled`；重复 start 不得重置起点。
- 耗时使用 `performance.now()` 单调计时；`Date.now()` 只提供本地结束时刻。持久化 `startedAt` 由 `endedAt - durationMs` 推导，以保持 v1 数据不变量。
- 只使用 `appendEntry` + `registerEntryRenderer` 显示结果；不得使用 `setStatus`、`setFooter`、`sendMessage` 或 `sendUserMessage`。
- 持久化 `customType` 固定为 `response-timing`，用于兼容迁移前已经写入的会话记录。
- 恢复的 custom entry 视为不可信输入：时间戳必须是有效安全整数，且 `durationMs === endedAt - startedAt`。
- `session_shutdown` 只清理未完成计时，不追加伪完成记录。
- 不读取项目级配置，不新增运行时依赖，不统计单个工具或 dteam worker。

## 验证

改动后至少运行：

```bash
npm run typecheck
npm test
npm pack --dry-run
```

涉及生命周期或渲染时，再用 `pi --no-extensions -e ./index.ts` 做隔离加载或真实会话验证。

## 代码工程纪律

- 先核实现有实现、标准库、Pi 平台能力和已安装依赖，在第一个完整满足需求的层级停止。
- 模块按真实职责和生命周期划分；当前单文件足够时不新增透传层。
- 替换可用路径时先验证候选，再切换加载源，避免双重扩展并存。
- 只有公开契约或存量数据需要时保留兼容路径；`response-timing` 属于已有存量会话契约。
- 测试优先走扩展公开注册接口，mock 只放在 Pi 边界。
- 修复前先建立可重复反馈环；连续同类失败且没有新信息时停止重试并换轨。
- 临时调试日志必须带唯一标记，并在交付前清理。
