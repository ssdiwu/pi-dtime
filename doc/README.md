# 文档总览

`pi-dtime` 是小型单入口扩展，当前文档数量少且职责单一，保持平铺，不预建空编号目录。

## 阅读顺序与权威

1. `../README.md` 与 `../README-zh.md`：英文、中文用户行为、安装、开发和目录导航。
2. `../AGENTS.md`：实现边界与验证要求。
3. `../index.ts` 与 `../src/locales.ts`：生命周期、持久化、可选 i18n 桥接、locale 数据和渲染的当前实现权威。
4. `../tests/README.md`、`../tests/index.test.ts` 与 `../tests/locales.test.ts`：可复验行为。
5. `../CHANGELOG.md`：用户可感知变更时间线。

## 当前边界

- 没有独立路线图、PRD、ADR、术语表或归档材料；出现真实内容后再按职责创建。
- 文档与实现冲突时，以当前代码和测试结果为行为事实，并同步修正文档。
- `response-timing` 是已有会话条目的持久化兼容标识，不等同于 npm 包名。
- `pi-di18n` 只通过 `pi.i18n.v1` 公开事件/API 可选接入；缺失或异常不得影响独立中文计时。
