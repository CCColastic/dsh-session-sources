# Session Sources

[简体中文](./README_ZH.md) · **English**

Recover images, files, and explicit HTTP/HTTPS links from the **current DeepSeek Harness conversation**—without leaving the chat.

Session Sources provides a native **Sources** panel and an optional, manageable **Session Sources** tab for `dsh-better-sidebar`. It does not modify DSH core.

## Features

- **Per-session recovery:** images, ordinary files, and links are indexed from the current session, including history created before installation.
- **Native and managed entries:** use the conversation-header **Sources** button, DSH's native right sidebar, or the optional `dsh-better-sidebar` tab.
- **Preview and reuse:** preview images, download attachments, re-attach them to the current composer, and open or copy links.
- **Source details:** inspect every occurrence, including its timestamp, message sequence, original user message, and attachment metadata.
- **Privacy by default:** no automatic web fetching, model calls, background tasks, context injection, or deletion of original attachments.

## Requirements

- DeepSeek Harness `>=0.2.1-rc.5 <0.2.2-0`
- Optional: `dsh-better-sidebar` for the manageable tab under **Settings → Side cards**
- Node.js 22+ and pnpm only when building from source

## Installation

Replace `<profile>` with your DSH profile, such as `web` or `desktop`.

```sh
dsh plugin --profile <profile> add github:CCColastic/dsh-session-sources
```

To use the optional manageable tab, install `dsh-better-sidebar` first:

```sh
dsh plugin --profile <profile> add dsh-better-sidebar@0.28.2
dsh plugin --profile <profile> add github:CCColastic/dsh-session-sources
```

You can also paste the repository URL into DSH's plugin manager:

```text
https://github.com/CCColastic/dsh-session-sources
```

Follow the installer's receipt: refresh the GUI for client-only updates, or restart DSH if host changes require it. Do not manually edit the profile package manifest or Cordis patch.

## Usage

1. Open **Sources** from the conversation header or the native right-sidebar guide. With `dsh-better-sidebar`, enable **Session Sources** under **Settings → Side cards**, then open it from the sidebar **+** menu.
2. Filter by **All / Images / Files / Links**, or search by name and URL.
3. Open an image thumbnail to preview it, fit it to the window or use its original size, download it, or attach it again.
4. Download or re-attach ordinary files. When the host provides a usable path, supported files can also open in DSH's native previewer.
5. Open or copy links. The plugin never fetches a page merely to discover its title or check availability.
6. Expand **View source** to inspect the original message and every occurrence.

**Re-attach** only adds an attachment to the current composer's pending area; you decide when to send it. Large files must pass through the browser and may temporarily consume significant memory.

## Session and privacy model

- Only native `user/message` events contribute user images, files, and explicit HTTP/HTTPS links. Model, tool, system, and subagent output is excluded.
- Switching conversations switches the panel to that conversation's own projection. Forks include their inherited visible prefix; subagent sessions are not merged into their parent.
- Images and files are deduplicated by `(kind, attachmentId)`. Repeated sends retain separate source occurrences.
- Links are deduplicated by their complete original URL string. Query parameters, order, fragments, case, ports, and trailing slashes are preserved.
- Attachment routes require an authenticated owner browser connection and verify membership in the addressed session.
- Original attachments are read through DSH's attachment services. The plugin does not maintain another attachment store or provide deletion.

## Known limitations

**Direct navigation to the source message in the main chat is not implemented.** DSH 0.2.1-rc.5 does not expose a public message-navigation action to these sidebar/header entry points. **View source** is an explicit alternative, not native chat navigation.

Missing or damaged attachments are shown as unavailable while other entries remain usable. Status checks verify existence and size; downloads perform the host's normal integrity checks. A missing original cannot be reconstructed from the index.

## Development

```sh
pnpm install --ignore-scripts
pnpm run build
pnpm test
pnpm pack --pack-destination dist
python scripts/verify-package.py
```

Main modules:

- `src/indexer.js` — pure session-event projection and source identity
- `src/server.js` — authenticated, session-scoped reads and downloads
- `src/client.js` / `src/client.css` — native panel and better-sidebar adapter
- `index.js` — host projection and route registration
- `client.js` — generated browser bundle; no second React copy

The better-sidebar integration uses its public `ctx.betterSidebar.registerTab` API and retains the native panel as a fallback. See the [external plugin guide](https://github.com/omdsh-dev/DSH-better-sidebar/blob/main/docs/external-plugin-guide.md).

## Verification and documentation

- 31 automated tests cover projection, isolation, links, attachment I/O, authentication, managed-tab registration, disposal, Start-guide deduplication, delayed-service replacement, and session adaptation.
- [Acceptance and known boundaries](./docs/acceptance.md)
- [Installation details](./docs/installation.md)
- [Reference and license audit](./docs/reference-audit.md)

Automated and host-integration tests are not a substitute for full GUI acceptance on every DSH version and theme.

## License

[MIT](./LICENSE) © 2026 Session Sources contributors
