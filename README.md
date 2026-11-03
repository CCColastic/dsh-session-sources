# 会话资料 / Session Sources

为 DeepSeek Harness 当前聊天页提供“资料”入口和右侧 Sources 面板。版本 0.1.2，面向 DSH 0.2.1-rc.5；不修改 DSH 核心。

**English:** Recover images, files, and explicit HTTP/HTTPS links from the current DeepSeek Harness conversation. Includes a native sidebar panel and an optional manageable tab for `dsh-better-sidebar`, with per-session isolation. Licensed under MIT.

## 使用

1. 安装并启用插件后，在已开始的会话右上角点击 **资料**，或从右侧栏的开始页打开 **会话资料**。安装并启用 `dsh-better-sidebar` 时，插件还会注册一个可管理的“会话资料”Tab，可在「设置 → 侧边卡片」中启停；没有该插件时保留原生入口。
2. 使用“全部、图片、文件、链接”分类或搜索名称 / URL。切换会话后面板读取该会话自身的历史；分支会话包括继承的可见消息，子智能体不会合入父会话。
3. 图片缩略图可打开大图，支持适应窗口 / 原始尺寸、下载和再次附加。文件支持下载、再次附加，并在可取得宿主路径时交给 DSH 原生预览器；实际可预览类型由宿主决定。
4. **再次附加**把附件放入当前输入框的待发送附件区，用户自行发送。普通文件使用宿主原有上传队列；宿主存储根据内容去重，插件不另外保存原件。浏览器仍需临时读取附件字节，大文件消耗内存。
5. 链接可打开和复制。不自动联网探测、不抓取网页、不为标题访问网站；行标题只采用消息中的 Markdown 标签或 URL。
6. **查看来源**展开每次出现的消息，点击时间可读该条原始用户消息及其附件信息。

## 当前限制与明确的替代交互

**本版本没有实现主聊天区的直接消息跳转。** DSH 0.2.1-rc.5 将 `openView(view, focus)` 限定在 `conversation.view` 的 ownerProps 中，右侧面板和标题栏工具没有公开导航动作。插件不修改聊天 DOM，也不替换聊天页。现提供“查看来源”原文面板（时间、消息序号、原文、各次出现记录）作为替代，不把它标为原生跳转。验收第 4 项因此仅部分满足。

已开始的会话在标题栏显示固定入口。DSH 的空白会话会隐藏整个 utilities 区，此时可从右侧栏开始页打开资料。当前第一版的附件 API 仅面向通过宿主认证的 owner 浏览器连接，委派 API 权限不开放。

损坏 / 缺失附件显示不可用，来源仍可查看，其他条目继续工作。状态检查只确认文件存在和大小；下载时通过宿主 `readImage` / `readFileStream` 校验。原件丢失时无法凭索引恢复原件。链接可用性由用户打开时判断，面板不会未经用户操作发出外部请求。

## 收集与去重

- 仅原生 `user/message` 中用户来源的图片、普通文件和文本明确出现的 HTTP/HTTPS 链接；忽略模型、工具、系统和子智能体输出。
- 图片和文件分别按 `(类型, attachmentId)` 去重。同一消息的宿主替换 / offload 版本按消息 ID 合并，各次重新发送仍保留来源。
- 链接按提取后的 **完整原始 URL 字符串** 去重。不改查询参数、顺序、fragment、大小写、端口或末尾斜线。
- 显式 Markdown / `<URL>` 保留目标内容。真正裸 URL 无 query / fragment 时剥离句末 `.,;` 和未配对的外层闭括号；有 query / fragment 的含混尾部保守保留，避免更改有效数据。链接含这些标点且可能与正文混淆时，推荐 `<URL>` 写法。
- 不支持从 HTML 属性、相对链接或网页内容推断 URL。会话记录是归属依据；原生会话投影缓存可丢弃重建，安装前的已有消息不需重新上传。
- 不注册模型工具、系统提示词、自动任务或资料上下文注入；打开、搜索、浏览、下载和重新附加都不调用模型。
- 不提供删除原件功能。

## 安装包与源码

分发包为 `local-dsh-session-sources-0.1.2.tgz`。也可通过 DSH 插件管理器直接从 GitHub 安装：

```text
https://github.com/CCColastic/dsh-session-sources
```

使用代理安装时调用内置 `plugin_manager`，`action: install_bundle`，`target` 为仓库地址、源码目录或安装包路径。不要手工修改 profile 的包清单或补丁。安装新包可由宿主热加载；若安装结果提示需要重启，先保存会话再重启 DSH。本目录不含安装脚本，也没有需要批准的依赖构建脚本。

开发命令（Node 22+ / pnpm）：

```powershell
pnpm install --ignore-scripts
pnpm run build
pnpm test
pnpm pack --pack-destination dist
```

主要实现：`src/indexer.js`（纯会话投影）、`src/server.js`（认证与按会话读取）、`src/client.js` / `src/client.css`（右侧面板）、`index.js`（宿主注册）。构建后的 `client.js` 可直接加载，不引入第二份 React，也不 require DSH 内部 Client 组件。

## 验证与参考项目

详细验收结果见 `docs/acceptance.md`，参考源码与 MIT 许可核对见 `docs/reference-audit.md`。源码测试在当前 Windows 环境中运行；这些测试不等于已完成 Electron GUI 的全部手动验收。重启恢复、实际点击和主题外观的结果以验收记录为准。

本插件代码和图标为新编写，采用 MIT 许可；未直接复制三个参考项目源码。
