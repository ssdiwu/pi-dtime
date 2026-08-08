# tests/

`pi-dtime` 的 Vitest 行为测试目录。

- `index.test.ts`：通过扩展公开注册接口验证完整回复计时、可选 i18n 接入、运行时语言切换、加载顺序与失败降级、系统时钟回拨、持久化数据校验和 shutdown 清理。
- `locales.test.ts`：验证 25 locale 覆盖、bundle 契约、语言别名与确定性回退。

运行：

```bash
npm test
```
