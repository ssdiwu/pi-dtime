# tests/

`pi-dtime` 的 Vitest 行为测试目录。

- `index.test.ts`：通过扩展公开注册接口验证完整回复计时、重复 `agent_start`、系统时钟回拨、持久化数据校验与 `session_shutdown` 清理。

运行：

```bash
npm test
```
