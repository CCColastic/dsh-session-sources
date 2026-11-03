# 三个参考项目的独立源码与许可审计

核查日期：2026-11-02（Asia/Hong_Kong）。目标宿主：DSH **0.2.1-rc.5**。使用 `web_fetch` 读取三个指定仓库的 GitHub API `commits/HEAD`、Git tree 和固定 SHA 的 raw 源码、清单与许可证。功能判断以实现为准。本次只新增本文，未安装插件、修改宿主或引入第三方实现。

## 固定 HEAD 与许可证据

| 指定仓库 | exact HEAD SHA | 清单版本 | LICENSE 文件证据 |
| --- | --- | --- | --- |
| [ZZZZZZZ-ZZZZZ/dsh-attachment-library](https://github.com/ZZZZZZZ-ZZZZZ/dsh-attachment-library) | `bc9305147710d20d3e039cb407bcb5f4572af2f3` | `dsh-plugin-attachment-library@0.4.1` | [MIT LICENSE](https://github.com/ZZZZZZZ-ZZZZZ/dsh-attachment-library/blob/bc9305147710d20d3e039cb407bcb5f4572af2f3/LICENSE)，版权 `2026 ZZ`，Git blob `451226f922ebf9aee80363459a6baea2972b8616` |
| [taxueseek/dsh-files](https://github.com/taxueseek/dsh-files) | `900d4b4904ab81e9c63f534db6d7937c8b2386d9` | `dsh-files@0.6.3` | [MIT LICENSE](https://github.com/taxueseek/dsh-files/blob/900d4b4904ab81e9c63f534db6d7937c8b2386d9/LICENSE)，版权 `2026 taxueseek`，Git blob `76c5161dffd3c39c5ca5045f7780b186f38e75ca` |
| [suomir1995/dsh-link-collect](https://github.com/suomir1995/dsh-link-collect) | `005e649742bcbf586389b984dcd85aab0244fb35` | `dsh-link-collect@0.1.1` | [MIT LICENSE](https://github.com/suomir1995/dsh-link-collect/blob/005e649742bcbf586389b984dcd85aab0244fb35/LICENSE)，版权 `2026 suomir`，Git blob `cf4b222b899cd5dd1a7c0680e61d6d582562338c` |

本次 HEAD API：[attachment-library](https://api.github.com/repos/ZZZZZZZ-ZZZZZ/dsh-attachment-library/commits/HEAD)、[dsh-files](https://api.github.com/repos/taxueseek/dsh-files/commits/HEAD)、[link-collect](https://api.github.com/repos/suomir1995/dsh-link-collect/commits/HEAD)。后文引用全部固定 SHA，避免默认分支漂移。三份固定 SHA 的 LICENSE raw 文件均 HTTP 200，三份清单均声明 MIT。

MIT 允许使用、修改及分发，复制实现或 substantial portions 时须保留版权及许可声明。attachment-library 的 LICENSE 还说明 `encodeSegment` 复现 DSH 的目录编码；其 [tests/vendor/ui-primitives/LICENSE](https://github.com/ZZZZZZZ-ZZZZZ/dsh-attachment-library/blob/bc9305147710d20d3e039cb407bcb5f4572af2f3/tests/vendor/ui-primitives/LICENSE) 独立保留 DeepSeek MIT 版权。本文只记录事实和引用，不复制这些实现。

## 能力对照

| 项目 | 实际图片/文件覆盖 | 会话与消息归属 | 重新附加和下载 | 链接范围 |
| --- | --- | --- | --- | --- |
| attachment-library | 图片 `objects`，文件 `file-objects` 和 `files` 名称 | 扫日志统计引用会话；不保留每次出现的 seq/message id | 本机 reveal，macOS Preview；无重新附加和浏览器下载 | 不采集会话 URL |
| dsh-files | 库只扫描 `files`；不覆盖原生图片 `objects` | 全库列表；无会话/工作区过滤及引用索引 | 下载字节后创建新草稿，或插入 handle 引用；浏览器下载/工作区导出 | 不采集会话 URL |
| link-collect | 只下载站点 favicon；不扫描 DSH 附件 | 全局 Markdown 收藏夹；无会话/消息身份 | 打开目标 URL；无 DSH 附件重新附加 | UI/工具显式收藏，无聊天自动采集 |

证据：[A-library]、[A-catalog]、[A-index]、[A-ui]、[B-scan]、[B-loop]、[B-dock]、[B-client]、[C-host]、[C-panel]。

## attachment-library：完整对象识别，来源粒度为会话

- `listStoredObjects` 分别枚举 `objects/<sha2>/<sha>` 与 `file-objects/<sha2>/<sha>`，收集 `files/<sha2>/<sha>/<name>` 显示名。图片对象没有扩展名，名称主要来自日志。最多读取前 64 KiB 探测 PNG/JPEG/WebP/GIF 格式和尺寸；这不是全库逐件完整解码或 digest 校验。[A-library]
- 引用必须是带 `type: image|file`、`attachment.attachmentId: sha256:<64 lowercase hex>` 的结构化对象。扫描递归遍历事件中的数组和对象，最大深度 64，可发现用户消息、系统消息、工具结果中的真实附件。普通路径、Markdown 图片、URL、`sha256:` 文本不会仅因出现在文本中而被当作真实附件。[A-library]
- `LogScanner` 每个 `(kind, sha)` 只保留首次 fact，catalog 每个附件/会话去重；输出没有每次出现的 message id/seq，不能直接用于“跳转到来源消息”。当前日志经 `sessionPersistence.list/open(id, 'read')` 读取并按 revision 缓存，回收站另读 JSONL/Zstandard。`conversationRoots` 仅在 `origin === subagent` 时上溯 `parentSession`；fork 是独立会话。读日志失败会报告 problems，此时 unreferenced 不能证明没有引用。[A-catalog] [A-index] [A-built]
- UI 位于 Settings，呈现类型图标、名字、大小、图片格式/尺寸及引用会话标题，没有内嵌图片缩略图。操作只有本机 reveal 和 macOS Preview；Preview 打开带正确扩展名、核对 digest 的只读临时副本。客户端要求 loopback、本机 opener 能力及官方 desktop handoff。无附件重新附加、浏览器下载或消息定位接口。[A-ui] [A-client] [A-index]

## dsh-files：复用/下载可借鉴，范围是全库文件

- `listAttachments` 只读 `files`，每个 SHA 多个名字时只取字典序第一个。条目只有 name、sha、bytes、modifiedMs。工具/提示里的“session attachment library/this workspace”措辞不代表过滤条件：实现没有 sessionId/cwd 参数，范围由同一 `attachmentsDir` 决定。原生 `objects` 图片不入清单；以普通文件保存的图片可按文件被列出。[B-scan] [B-tool] [B-host]
- “重新插入”请求 `GET /plugins/dsh-files/attachments/download?ref=…`，取 Blob 后构造 File，经 `conversation.createDrafts(sessionId, files)` 和 `inputActions.addAttachments(ids)` 加入草稿。构造 File 时没有传 MIME type，不能据此声称保留原生图片视觉语义；用户发送草稿后才有新消息引用。[B-dock] [B-client]
- `@` 附件源取 `llm.fileRequestText` 生成的 handle，返回 `insert` 引用及序列化 codec；不是下载再上传，也不维护消息来源索引。候选来自全库，过滤没有 handle 的条目后限制 50 条。[B-client] [B-loop]
- 下载从官方 `AttachmentStore.readFileStream` 取字节，返回 `application/octet-stream`、attachment Content-Disposition 和 UTF-8 filename；要求 ref 出现在库清单且不超大小上限。默认 `maxDownloadBytes` 为 200 MiB。UI 导出也经该 stream；模型 `export_attachment` 则通过 `ctx.fs.resolve/stat` 和 `COPYFILE_EXCL` 复制，不是同一写入路径。[B-loop] [B-tool] [B-host]
- UI 导出目的地是 `sessions.get(sessionId)?.header?.cwd` 下的 `attachments/`；防重名检查和写入不是排他创建。当前宿主的 `workingDirectory.get(session)` 另表达有效目录，重新实现应明确目录语义。异步重新附加依赖模块级 `currentInputActions`，切换会话时需防目标与当前输入区失配。[B-loop] [B-dock]
- 当前源码**有删除功能**：DELETE 路由直接移除 `files/<sha2>/<sha>`，UI 两次点击确认；没有会话引用审查，也不同时删除 canonical `file-objects`。移除名字链接可能破坏历史 file path。只读 Sources 不应继承此动作。[B-loop] [B-dock]

## link-collect：显式收藏不是会话自动采集

Host 在本地库目录保存收藏夹 Markdown，一个文件一个收藏夹；每条包括 URL、标题、简介、标签和自由正文。新增来自 UI 或 `link_collect_add`，另有 search/list 工具，无聊天消息监听/扫描或 sessionId/messageId/seq 索引。[C-host] [C-readme]

`probePage` 在超时和字节上限内提取 title 和 rel icon；favicon 依次尝试站点 `/favicon.ico`、HTML rel icon、DuckDuckGo fallback，缓存到 `icons/`。这是图标下载，不是网页完整快照；自由正文也不是自动网页归档。卡片打开目标网站，没有网页文件下载和 DSH 附件重新附加。[C-host] [C-panel]

UI 通过 CSS/DOM 选择器寻找旧侧栏 New Session 区域，以 MutationObserver 和轮询维持入口，并在 document.body 追加自建 React overlay。数据字段可参考，当前正式 sidebar tab/slot 接线应独立实现。[C-entry] [C-client] [C-panel]

## 当前宿主兼容风险

官方 [dsh-v0.2.1-rc.5 tag API](https://api.github.com/repos/deepseek-ai/deepseek-harness/git/ref/tags/dsh-v0.2.1-rc.5) 指向 **`b830ec950faba0a46dda564be3e2d854afed94f1`**。官方引用固定此 SHA；本机读取的 attachment-local、ui-conversation、plugin-manager 清单也均为 rc.5。

官方版本检查优先 `engines.dsh`；缺席时检查全部 DSH peers，包括 optional peers，使用 `includePrerelease: true`。自定义 `dsh.compatibility` 不能代替这一规则。[H-compat]

| 项目 | rc.5 版本门槛 | 其余风险 |
| --- | --- | --- |
| attachment-library | `engines.dsh >=0.2.0-rc.2 <0.3.0` 可满足 | 开发依赖 rc.2；磁盘/回收站格式、Remote/Settings 与原生 opener 仍需当前验证；Windows 没有 Preview |
| dsh-files | DSH peers 的 `^0.2.1-alpha.1` 分支可满足 | 开发依赖和声明验证到 rc.3；duck-typed concrete createDrafts/输入动作/LLM seam、旧 primitive 名称及 UI 行为未经 rc.5 实测；全库范围不能充当会话授权 |
| link-collect | 所有 `@deepseek-ai/dsh-tools` peer 分支均 `<0.2.0-0`，**不满足** | optional 不豁免，Host 顶层仍静态导入 defineTool；DOM 结构耦合 |

清单：[A-package]、[B-package]、[C-package]。未安装或授予豁免。Host Inspect 已确认 attachments、sessionPersistence 读 handle、workspaceRegistry、workingDirectory、workspaceFiles 当前存在；Client Service/Slot Inspect 各等待 10 秒后超时，因此版本可满足不等于当前页面实测成功。

rc.5 原生图片保存的是归一化后的 `objects`，文件为 canonical `file-objects` 及带原名的 `files` 链接；图片读取校验 digest 和媒体元数据，文件流校验字节数/digest。图片下载应称“保存的图片”，不能保证为入库前原始字节。[H-images] [H-local] [H-files]

## 补核：公开消息定位与原生文件预览

固定 rc.5 未找到可从 additive right-sidebar tab/header utility 调用的公开“打开 Chat 并定位 user/message seq”动作：

- `IConversation` 公开 input/blocks、send、updateQueue、cancel、loadOlder，无消息导航。[H-conversation]
- `UiConversation.binding` 提供 snapshot/openTurn/activate/target；activate 只激活组装目标，不选择主视图或滚动消息。[H-assembly]
- `UiWorkspace.openSession(target)` 只接会话或 subagent address，没有 seq/message id/focus。[H-navigation]
- `openView(view, focus)` 由 conversation.session 的 inject 闭包经 DefaultConversationViews 下传给 conversation.view ownerProps；header utility 和右栏 tab 没有该 share。focus 是目标 View 自有的 opaque identity，不能把任意 seq 当作既定 Chat 协议。[H-apply] [H-defaultviews] [H-views]

在不读聊天 DOM、不替换其他 owner slot、不改宿主的约束下，可实现“在 Sources 查看来源消息原文及身份/时间”作为明确替代；**主聊天原生跳转尚未达成**。结论限定本次检查的 rc.5 公开接口。

`ctx.sidebarRight.openResource` 接受由 registry 认领的 `dsh-resource://<type>/…`，不接受裸本机路径。当前文档预览只接受 session scope 的 file address：[H-sidebar] [H-preview-rpc]

`dsh-resource://file/session/<sessionId>/<path>` 中 sessionId 和 path 每段分别 component encode；反斜杠转 `/`，驱动器冒号保留。路径可以相对该 Session 或为绝对路径。例如 `dsh-resource://file/session/example-session/E:/data/report%20A.pdf`。官方 sessionFileAddress/fileAddressFor 表达这一语法；保留对空格、#、? 的逐段编码。[H-address] [H-path]

附件真实 `files/<sha2>/<sha>/<name>` 的绝对 fileHostPath 可以作为上述 session address 的 path 接原生预览。workspaceFiles 明确允许 workspace 外绝对普通文件，遵守组合 filesystem 读取权限；完整文件读取默认限 32 MiB，仍受部署配置、预览器格式支持及读取结果约束。本次未点击页面验证。[H-workspacefiles]

无扩展名原生图片对象不能仅凭上述路径保证图片预览识别。更合适的公开能力是 `uiConversation.imageUrl(sessionId, attachment)`，按会话授权取得并缓存图片 URL；下载、MIME 和文件名保留仍需 Sources 实现。[H-assembly]

## 对 Sources 实现的直接约束

1. 用真实附件结构建立当前会话索引；保留每次来源 seq/message identity，以 kind+attachmentId 去重并保留多处来源。普通路径、文本 handle、URL 单独识别。
2. 图片与文件采用各自读取 seam，保留 MIME、名字、missing 状态及归一化事实。全局文件库不能替代会话图片覆盖。
3. 明确区分插入已有引用、下载后新建草稿、导出工作区；异步动作完成前核对目标会话。
4. URL 自动采集的消息角色、Markdown/裸链接、代码块与去重规则需自行界定；三个参考项目没有该现成功能。
5. 只用公开 slot/service；文件可接原生预览，消息原生跳转缺项应如实披露。

[A-package]: https://github.com/ZZZZZZZ-ZZZZZ/dsh-attachment-library/blob/bc9305147710d20d3e039cb407bcb5f4572af2f3/package.json
[A-library]: https://github.com/ZZZZZZZ-ZZZZZ/dsh-attachment-library/blob/bc9305147710d20d3e039cb407bcb5f4572af2f3/src/library.ts
[A-index]: https://github.com/ZZZZZZZ-ZZZZZ/dsh-attachment-library/blob/bc9305147710d20d3e039cb407bcb5f4572af2f3/src/index.ts
[A-built]: https://github.com/ZZZZZZZ-ZZZZZ/dsh-attachment-library/blob/bc9305147710d20d3e039cb407bcb5f4572af2f3/lib/index.js
[A-catalog]: https://github.com/ZZZZZZZ-ZZZZZ/dsh-attachment-library/blob/bc9305147710d20d3e039cb407bcb5f4572af2f3/src/catalog.ts
[A-client]: https://github.com/ZZZZZZZ-ZZZZZ/dsh-attachment-library/blob/bc9305147710d20d3e039cb407bcb5f4572af2f3/src/client/index.tsx
[A-ui]: https://github.com/ZZZZZZZ-ZZZZZ/dsh-attachment-library/blob/bc9305147710d20d3e039cb407bcb5f4572af2f3/src/client/components.tsx
[B-package]: https://github.com/taxueseek/dsh-files/blob/900d4b4904ab81e9c63f534db6d7937c8b2386d9/package.json
[B-scan]: https://github.com/taxueseek/dsh-files/blob/900d4b4904ab81e9c63f534db6d7937c8b2386d9/src/attachments.ts
[B-loop]: https://github.com/taxueseek/dsh-files/blob/900d4b4904ab81e9c63f534db6d7937c8b2386d9/src/attachment-loop.ts
[B-dock]: https://github.com/taxueseek/dsh-files/blob/900d4b4904ab81e9c63f534db6d7937c8b2386d9/src/client/dock.tsx
[B-client]: https://github.com/taxueseek/dsh-files/blob/900d4b4904ab81e9c63f534db6d7937c8b2386d9/src/client/index.tsx
[B-tool]: https://github.com/taxueseek/dsh-files/blob/900d4b4904ab81e9c63f534db6d7937c8b2386d9/src/attachment-tool.ts
[B-host]: https://github.com/taxueseek/dsh-files/blob/900d4b4904ab81e9c63f534db6d7937c8b2386d9/src/index.ts
[C-package]: https://github.com/suomir1995/dsh-link-collect/blob/005e649742bcbf586389b984dcd85aab0244fb35/package.json
[C-host]: https://github.com/suomir1995/dsh-link-collect/blob/005e649742bcbf586389b984dcd85aab0244fb35/index.js
[C-readme]: https://github.com/suomir1995/dsh-link-collect/blob/005e649742bcbf586389b984dcd85aab0244fb35/README.md
[C-entry]: https://github.com/suomir1995/dsh-link-collect/blob/005e649742bcbf586389b984dcd85aab0244fb35/src/client/sidebar-entry.ts
[C-client]: https://github.com/suomir1995/dsh-link-collect/blob/005e649742bcbf586389b984dcd85aab0244fb35/src/client/index.ts
[C-panel]: https://github.com/suomir1995/dsh-link-collect/blob/005e649742bcbf586389b984dcd85aab0244fb35/src/client/panel.tsx
[H-compat]: https://github.com/deepseek-ai/deepseek-harness/blob/b830ec950faba0a46dda564be3e2d854afed94f1/packages/boot/app-boot/src/plugin-compatibility.ts
[H-local]: https://github.com/deepseek-ai/deepseek-harness/blob/b830ec950faba0a46dda564be3e2d854afed94f1/packages/attachment/attachment-local/src/index.ts
[H-images]: https://github.com/deepseek-ai/deepseek-harness/blob/b830ec950faba0a46dda564be3e2d854afed94f1/packages/attachment/attachment-local/src/store.ts
[H-files]: https://github.com/deepseek-ai/deepseek-harness/blob/b830ec950faba0a46dda564be3e2d854afed94f1/packages/attachment/attachment-local/src/file-store.ts
[H-conversation]: https://github.com/deepseek-ai/deepseek-harness/blob/b830ec950faba0a46dda564be3e2d854afed94f1/packages/client/ui-conversation/src/client/service.ts
[H-assembly]: https://github.com/deepseek-ai/deepseek-harness/blob/b830ec950faba0a46dda564be3e2d854afed94f1/packages/client/ui-conversation/src/client/conversation/assembly.ts
[H-navigation]: https://github.com/deepseek-ai/deepseek-harness/blob/b830ec950faba0a46dda564be3e2d854afed94f1/packages/client/ui-workspace/src/client/navigation.ts
[H-apply]: https://github.com/deepseek-ai/deepseek-harness/blob/b830ec950faba0a46dda564be3e2d854afed94f1/packages/client/ui-conversation/src/client/apply.ts
[H-defaultviews]: https://github.com/deepseek-ai/deepseek-harness/blob/b830ec950faba0a46dda564be3e2d854afed94f1/packages/client/ui-conversation/src/client/skeleton/DefaultConversationViews.tsx
[H-views]: https://github.com/deepseek-ai/deepseek-harness/blob/b830ec950faba0a46dda564be3e2d854afed94f1/packages/client/ui-conversation/src/client/contract/views.ts
[H-sidebar]: https://github.com/deepseek-ai/deepseek-harness/blob/b830ec950faba0a46dda564be3e2d854afed94f1/packages/client/ui-sidebar-right/src/client/service.ts
[H-preview-rpc]: https://github.com/deepseek-ai/deepseek-harness/blob/b830ec950faba0a46dda564be3e2d854afed94f1/packages/client/ui-sidebar-documentpreview/src/client/rpc.ts
[H-address]: https://github.com/deepseek-ai/deepseek-harness/blob/b830ec950faba0a46dda564be3e2d854afed94f1/packages/util/workspace-path/src/file-address.ts
[H-path]: https://github.com/deepseek-ai/deepseek-harness/blob/b830ec950faba0a46dda564be3e2d854afed94f1/packages/util/workspace-path/src/index.ts
[H-workspacefiles]: https://github.com/deepseek-ai/deepseek-harness/blob/b830ec950faba0a46dda564be3e2d854afed94f1/packages/api/workspace-files/src/index.ts
