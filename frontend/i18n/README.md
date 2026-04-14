# Frontend i18n

Renderer 侧统一使用 `t("group.key")` 做文案查找，语言文件放在 `frontend/locales/`。

## 当前实现

- 入口导出：`frontend/i18n/index.ts`
- 实际实现：`frontend/util/i18n.ts`
- 语言文件：`frontend/locales/en.json`、`frontend/locales/zh-CN.json`

## Core API

- `initI18n(preferredLocale?)`: 初始化 locale，优先使用传入值，其次本地存储和浏览器语言，最终默认 `zh-CN`
- `t(key, vars?, fallbackText?)`: 按 key 查找文案并支持 `{{var}}` 插值
- `setLocale(locale)`: 切换语言并持久化到 `localStorage`
- `getLocale()`: 获取当前语言

## Add a New Language

1. 新增 `frontend/locales/<locale>.json`
2. 保持与现有 key 结构一致，例如 `common.cancel`、`onboarding.waveAITitle`
3. 在 `frontend/util/i18n.ts` 的 `messages` 对象中注册新语言

示例 locale: `ja`、`fr`、`de-DE`
