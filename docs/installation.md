# 安装与加载

## 环境要求

- DeepSeek Harness `>=0.2.1-rc.5 <0.2.2-0`
- Node.js 22+（仅从源码构建时需要）
- 可选：`dsh-better-sidebar`，用于「设置 → 侧边卡片」中的可管理 Tab

## 通过 DSH 安装

使用 DSH 插件管理器安装本仓库或发布包，不要手工编辑 profile 的包清单或补丁。插件管理器可使用以下 GitHub 地址：

```text
https://github.com/CCColastic/dsh-session-sources
```

安装后按宿主回执刷新页面或重启。启用 `dsh-better-sidebar` 时，可在「设置 → 侧边卡片」中启停“会话资料”；没有该插件时仍可使用原生标题栏和右侧栏入口。

## 从源码构建

```powershell
pnpm install --ignore-scripts
pnpm run build
pnpm test
pnpm pack --pack-destination dist
```

构建会生成可直接由 DSH Client 加载的 `client.js`。开发验收与已知限制见 [acceptance.md](acceptance.md)。
