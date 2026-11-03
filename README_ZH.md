# 会话资料 / Session Sources

**简体中文** · [English](./README.md)

在**当前 DeepSeek Harness 会话**中直接找回图片、文件和明确出现的 HTTP/HTTPS 链接，无需离开聊天页。

本插件提供原生“资料”面板，并为 `dsh-better-sidebar` 提供可管理的“会话资料”Tab；不修改 DSH 核心。

## 功能

- **按会话恢复**：从当前会话历史索引图片、普通文件和链接，包括安装前已经存在的消息。
- **原生与可管理入口**：支持会话标题栏“资料”、DSH 原生右侧栏，以及可选的 `dsh-better-sidebar` Tab。
- **预览与复用**：图片放大预览、附件下载、再次附加到当前输入框、链接打开与复制。
- **来源详情**：查看每次出现的时间、消息序号、原始用户消息和附件信息。
- **默认保护隐私**：不自动联网抓取、不调用模型、不创建后台任务、不注入资料上下文，也不删除原始附件。

## 环境要求

- DeepSeek Harness `>=0.2.1-rc.5 <0.2.2-0`
- 可选：`dsh-better-sidebar`，用于「设置 → 侧边卡片」中的可管理 Tab
- 仅从源码构建时需要 Node.js 22+ 和 pnpm

## 安装

将 `<profile>` 替换为你的 DSH 配置名，例如 `web` 或 `desktop`。

```sh
dsh plugin --profile <profile> add github:CCColastic/dsh-session-sources
```

如需可管理的侧边 Tab，先安装 `dsh-better-sidebar`：

```sh
dsh plugin --profile <profile> add dsh-better-sidebar@0.28.2
dsh plugin --profile <profile> add github:CCColastic/dsh-session-sources
```

也可以把仓库地址交给 DSH 插件管理器：

```text
https://github.com/CCColastic/dsh-session-sources
```

按安装回执操作：纯客户端更新可刷新 GUI，Host 变更则根据提示重启 DSH。不要手工修改 profile 包清单或 Cordis 补丁。

## 使用

1. 在会话标题栏点击“资料”，或从原生右侧栏开始页打开“会话资料”。安装 `dsh-better-sidebar` 后，可在「设置 → 侧边卡片」启用该卡片，再从侧边栏 **+** 菜单打开。
2. 使用“全部 / 图片 / 文件 / 链接”分类，或按名称和 URL 搜索。
3. 点击图片缩略图可放大、适应窗口或查看原始尺寸，也可下载和再次附加。
4. 普通文件支持下载和再次附加；宿主提供可用路径时，受支持的格式可交给 DSH 原生预览器。
5. 链接可打开和复制。插件不会仅为获取标题或检查可用性而访问目标网站。
6. 展开“查看来源”可读取原始消息及每次出现记录。

**再次附加**只会把附件放入当前输入框的待发送区域，由你决定是否发送。大文件需要经过浏览器读取，可能暂时占用较多内存。

## 会话与隐私边界

- 仅收集原生 `user/message` 中用户来源的图片、文件和明确 HTTP/HTTPS 链接；忽略模型、工具、系统和子智能体输出。
- 切换会话后，面板读取该会话自己的投影。分支会话包含继承的可见前缀，子智能体不会合入父会话。
- 图片和文件按 `(类型, attachmentId)` 去重；重复发送仍保留各自来源。
- 链接按完整原始 URL 字符串去重，不改查询参数、顺序、fragment、大小写、端口或末尾斜线。
- 附件路由要求已认证的 owner 浏览器连接，并验证附件确实属于目标会话。
- 原件通过 DSH 附件服务读取。插件不另建附件库，也不提供删除原件功能。

## 当前限制

**尚未实现直接跳转主聊天区的来源消息。** DSH 0.2.1-rc.5 没有向这些侧栏/标题栏入口公开消息导航动作。“查看来源”是明确披露的替代交互，不是原生聊天跳转。

损坏或缺失附件显示不可用，其他条目仍可正常使用。状态检查只确认文件存在和大小；下载时执行宿主正常的完整性校验。原件丢失后无法仅凭索引恢复。

## 开发与构建

```sh
pnpm install --ignore-scripts
pnpm run build
pnpm test
pnpm pack --pack-destination dist
python scripts/verify-package.py
```

主要模块：

- `src/indexer.js`：纯会话事件投影与来源身份
- `src/server.js`：认证、按会话读取与下载
- `src/client.js` / `src/client.css`：原生面板和 better-sidebar 适配层
- `index.js`：Host 投影与路由注册
- `client.js`：生成的浏览器 bundle，不引入第二份 React

侧边 Tab 使用公开的 `ctx.betterSidebar.registerTab` 接口，并保留原生面板作为回退。开发规范见 [better-sidebar 外部插件接入指南](https://github.com/omdsh-dev/DSH-better-sidebar/blob/main/docs/external-plugin-guide.md)。

## 验证与文档

- 29 项自动测试覆盖投影、会话隔离、链接、附件读写、鉴权、Tab 注册与卸载、会话适配。
- [验收结果与功能边界](./docs/acceptance.md)
- [安装说明](./docs/installation.md)
- [参考项目与许可审计](./docs/reference-audit.md)

自动测试和 Host 集成检查不等于所有 DSH 版本、主题下的完整 GUI 验收。

## 许可证

[MIT](./LICENSE) © 2026 Session Sources contributors
