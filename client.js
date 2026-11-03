window.__ModuleLoader__.load({
  id: '@local/dsh-session-sources',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { useState, useEffect, useRef, useMemo } = React;
    const DICTS = {"zh":{"meta":{"title":"会话资料","description":"在当前聊天页找回用户提供过的图片、文件和链接，预览、下载并重新附加。"},"sources.title":"会话资料","sources.entry":"资料","sources.subtitle":"当前会话中提供过的资料","sources.all":"全部","sources.image":"图片","sources.file":"文件","sources.link":"链接","sources.search":"搜索名称或 URL","sources.empty":"本会话还没有资料","sources.emptyDetail":"用户消息中的图片、文件附件和 HTTP/HTTPS 链接会自动显示在这里。","sources.noResults":"没有匹配的资料","sources.loading":"正在从会话记录恢复资料…","sources.failed":"无法读取资料，请重试或重新打开会话。","sources.download":"下载","sources.attach":"再次附加","sources.open":"打开","sources.copy":"复制链接","sources.preview":"预览","sources.viewSource":"查看来源","sources.sources":"来源消息","sources.first":"首次出现","sources.occurrences":"次出现","sources.items":"项资料","sources.retry":"重试","sources.unavailable":"附件不可用：原件缺失或无法读取","sources.invalid":"附件记录损坏","sources.checking":"检查中…","sources.close":"关闭","sources.zoom":"原始尺寸 / 适应窗口","sources.attached":"已加入输入框待发送附件","sources.copied":"链接已复制","sources.busy":"处理中…","sources.actionFailed":"操作失败","sources.inputLocked":"当前输入框暂不可附加，请稍后重试。","sources.message":"来源消息原文","sources.noText":"此消息只有附件。","sources.jumpLimit":"当前 DSH 未向侧栏插件提供主聊天区的消息跳转接口；这里显示对应的原始用户消息。","sources.recoveryWarning":"部分记录损坏，其他资料仍可使用。","sources.scopeNote":"仅收集用户消息 · 不自动访问外部网站","sources.unknownTime":"时间未知","sources.refresh":"刷新资料","sources.openFailed":"链接无法打开时，可复制后在浏览器中检查。","sources.format":"文件","sources.sourceFailed":"来源消息无法读取","sources.downloaded":"下载已准备好","sources.clipboardFailed":"无法访问剪贴板，请选中 URL 手动复制。"},"en":{"meta":{"title":"Session Sources","description":"Recover user-provided images, files and links in the current chat; preview, download and attach again."},"sources.title":"Session Sources","sources.entry":"Sources","sources.subtitle":"Materials provided in this conversation","sources.all":"All","sources.image":"Images","sources.file":"Files","sources.link":"Links","sources.search":"Search name or URL","sources.empty":"No sources in this conversation","sources.emptyDetail":"Images, file attachments and explicit HTTP/HTTPS links in user messages appear here automatically.","sources.noResults":"No matching sources","sources.loading":"Recovering sources from session history…","sources.failed":"Unable to read sources. Retry or reopen the session.","sources.download":"Download","sources.attach":"Attach again","sources.open":"Open","sources.copy":"Copy URL","sources.preview":"Preview","sources.viewSource":"View source","sources.sources":"Source messages","sources.first":"First seen","sources.occurrences":"occurrences","sources.items":"sources","sources.retry":"Retry","sources.unavailable":"Attachment unavailable: missing or unreadable","sources.invalid":"Damaged attachment record","sources.checking":"Checking…","sources.close":"Close","sources.zoom":"Actual size / fit","sources.attached":"Added to the composer's pending attachments","sources.copied":"URL copied","sources.busy":"Working…","sources.actionFailed":"Action failed","sources.inputLocked":"The composer cannot accept attachments right now. Please retry.","sources.message":"Original source message","sources.noText":"This message contains attachments only.","sources.jumpLimit":"This DSH version exposes no sidebar-to-transcript message navigation API. The original user message is shown here.","sources.recoveryWarning":"Some records are damaged. Other sources remain usable.","sources.scopeNote":"User messages only · No automatic external requests","sources.unknownTime":"Unknown time","sources.refresh":"Refresh sources","sources.openFailed":"If the URL cannot open, copy it to inspect it in a browser.","sources.format":"File","sources.sourceFailed":"Unable to read the source message","sources.downloaded":"Download prepared","sources.clipboardFailed":"Clipboard unavailable. Select and copy the URL manually."}};
    const NS = 'sessionSources';
    const KIND = 'session-sources';
    const MANAGED_KIND = 'session-sources-managed';
    const ID = '@local/dsh-session-sources';
    const KEY = 'sessionSources';
    const css = ".ss-header-button,.ss-button{font:inherit;cursor:pointer;border:1px solid transparent;background:transparent;color:var(--dsw-alias-label-secondary);border-radius:8px;display:inline-flex;align-items:center;justify-content:center;gap:5px;white-space:nowrap;text-decoration:none;line-height:1.4}.ss-header-button{height:30px;padding:4px 8px;font-size:13px}.ss-header-button:hover,.ss-button:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}.ss-count{background:var(--dsw-alias-bg-layer-2);border-radius:6px;padding:0 5px;font-size:11px}.ss-button{font-size:12px;padding:4px 7px}.ss-button:disabled{opacity:.45;cursor:default}.ss-button:focus-visible,.ss-header-button:focus-visible,.ss-source-row:focus-visible,.ss-thumbnail:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}.ss-panel{box-sizing:border-box;display:flex;flex-direction:column;gap:12px;height:100%;min-height:0;min-width:0;width:100%;padding:20px 16px 12px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:13px;line-height:1.5}.ss-panel *{box-sizing:border-box}.ss-panel-heading{display:flex;align-items:center;justify-content:space-between;gap:8px}.ss-panel h2{font-size:17px;line-height:1.4;margin:0;font-weight:600}.ss-panel-heading p{margin:4px 0 0;color:var(--dsw-alias-label-secondary);font-size:12px}.ss-filters{display:flex;gap:4px;flex-wrap:wrap}.ss-filters .ss-button{padding:6px 9px}.ss-filters .ss-button[aria-pressed=true]{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-border-l1)}.ss-search{font:inherit;font-size:13px;width:100%;padding:9px 11px;border:1px solid var(--dsw-alias-border-l1);border-radius:10px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);outline:none}.ss-search:focus{border-color:var(--dsw-alias-brand-primary)}.ss-search::placeholder{color:var(--dsw-alias-label-secondary)}.ss-scope-note{font-size:11px;color:var(--dsw-alias-label-secondary)}.ss-list{overflow:auto;min-height:0;flex:1;scrollbar-gutter:stable;overscroll-behavior:contain}.ss-item{padding:14px 0;border-bottom:1px solid var(--dsw-alias-border-l1)}.ss-item:first-child{padding-top:3px}.ss-item:last-child{border-bottom:0}.ss-item-top{display:flex;align-items:flex-start;gap:11px;min-width:0}.ss-kind-icon{width:48px;height:48px;display:flex;align-items:center;justify-content:center;flex:none;background:var(--dsw-alias-bg-layer-1);border-radius:10px;color:var(--dsw-alias-label-secondary)}.ss-thumbnail{width:64px;height:64px;flex:none;overflow:hidden;border:1px solid var(--dsw-alias-border-l1);border-radius:9px;padding:0;background:var(--dsw-alias-bg-layer-1);cursor:zoom-in}.ss-thumbnail img{display:block;width:100%;height:100%;object-fit:contain}.ss-item-info{min-width:0;flex:1}.ss-item-name{font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-primary)}.ss-url{font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;user-select:text;color:var(--dsw-alias-label-secondary);margin:3px 0}.ss-muted{color:var(--dsw-alias-label-secondary);font-size:11px;overflow-wrap:anywhere}.ss-type{margin:3px 0}.ss-item-actions{display:flex;flex-wrap:wrap;gap:2px;margin-top:9px}.ss-error{font-size:12px;color:var(--dsw-alias-state-error-primary);padding:6px 0;overflow-wrap:anywhere}.ss-notice{font-size:12px;color:var(--dsw-alias-label-secondary);margin-top:6px;overflow-wrap:anywhere}.ss-sources{margin-top:10px;background:var(--dsw-alias-bg-layer-1);padding:10px;border:1px solid var(--dsw-alias-border-l1);border-radius:10px}.ss-source-heading{font-size:12px;font-weight:500;margin-bottom:5px}.ss-source-row{display:flex;flex-direction:column;text-align:left;gap:3px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:11px;border:0;border-radius:7px;padding:8px;width:100%;cursor:pointer}.ss-source-row:hover{background:var(--dsw-alias-bg-layer-2)}.ss-source-row .ss-muted{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.ss-original{padding-top:10px;margin-top:6px;border-top:1px solid var(--dsw-alias-border-l1)}.ss-original pre{font:inherit;font-size:12px;line-height:1.65;white-space:pre-wrap;overflow-wrap:anywhere;max-height:360px;overflow:auto;margin:8px 0;user-select:text}.ss-limit{font-size:11px;color:var(--dsw-alias-label-secondary);border-top:1px solid var(--dsw-alias-border-l1);padding-top:8px;margin:10px 0 0}.ss-empty{display:flex;flex-direction:column;align-items:center;gap:12px;color:var(--dsw-alias-label-secondary);text-align:center;padding:56px 12px}.ss-empty strong{font-size:14px;font-weight:500;color:var(--dsw-alias-label-primary)}.ss-empty p{font-size:12px;line-height:1.7;margin:0;max-width:270px}.ss-tab-title{display:inline-flex;align-items:center;gap:6px}.ss-lightbox{position:fixed;inset:0;width:min(1100px,94vw);max-width:94vw;height:min(840px,90vh);max-height:90vh;border:1px solid var(--dsw-alias-border-l2);border-radius:14px;padding:0;background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-primary);overflow:hidden}.ss-lightbox::backdrop{background:var(--dsw-alias-bg-overlay);opacity:.86}.ss-lightbox-inner{display:flex;flex-direction:column;height:100%;min-height:0}.ss-preview-toolbar{display:flex;align-items:center;gap:8px;padding:12px 16px;border-bottom:1px solid var(--dsw-alias-border-l1)}.ss-preview-toolbar strong{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px}.ss-image-stage{flex:1;min-height:0;display:grid;place-items:center;overflow:auto;padding:16px}.ss-image-fit{display:block;max-width:100%;max-height:100%;object-fit:contain;min-height:0}.ss-image-actual{max-width:none;max-height:none;display:block}@media(max-width:480px){.ss-panel{padding:16px 12px}.ss-preview-toolbar{gap:3px;padding:9px;flex-wrap:wrap}.ss-preview-toolbar strong{flex-basis:100%}.ss-lightbox{height:90vh}}@media(prefers-reduced-motion:reduce){.ss-panel *{scroll-behavior:auto}}\n";
    function glyph(kind, size = 20) {
      const paths = kind === 'image' ? ['M3 3h18v18H3z', 'm3 17 6-6 4 4 3-3 5 5', 'M15 7h.01'] : kind === 'link' ? ['m10 13 4-4', 'M8 16H6a4 4 0 0 1-3-7l4-4a4 4 0 0 1 6 0', 'M16 8h2a4 4 0 0 1 3 7l-4 4a4 4 0 0 1-6 0'] : ['M5 3h9l5 5v13H5z', 'M14 3v6h5', 'M8 13h8', 'M8 17h6'];
      return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }, ...paths.map((d, i) => h('path', { key: i, d })));
    }
    function api(action, sessionId, item, seq) {
      const url = new URL(`api/session-sources/${action}`, document.baseURI);
      url.searchParams.set('session', sessionId);
      url.searchParams.set('item', item.id);
      if (seq !== undefined) url.searchParams.set('seq', String(seq));
      return url.href;
    }
    async function request(url, signal) {
      const response = await fetch(url, { credentials: 'same-origin', signal });
      if (!response.ok) {
        const problem = await response.json().catch(() => ({}));
        throw new Error(problem.code || `HTTP ${response.status}`);
      }
      return response;
    }
    function sizeOf(value) {
      if (!Number.isFinite(value)) return '';
      if (value < 1024) return `${value} B`;
      if (value < 1024 ** 2) return `${(value / 1024).toFixed(1)} KB`;
      if (value < 1024 ** 3) return `${(value / 1024 ** 2).toFixed(1)} MB`;
      return `${(value / 1024 ** 3).toFixed(2)} GB`;
    }
    function fileName(item) {
      const raw = (item.name || 'attachment').replace(/[\u0000-\u001f\u007f/\\]/g, '_');
      const ext = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif' }[item.attachment?.mediaType];
      return item.kind === 'image' && ext && !/\.[a-z0-9]{1,8}$/i.test(raw) ? `${raw}.${ext}` : raw;
    }
    function when(time, t) { return time ? new Date(time).toLocaleString() : t('sources.unknownTime'); }
    function button(label, onClick, options = {}) { return h('button', { type: 'button', className: 'ss-button', onClick, ...options }, label); }
    function useLifetime(sessionId) {
      const ref = useRef();
      useEffect(() => {
        const controller = new AbortController();
        ref.current = controller;
        return () => { controller.abort(); if (ref.current === controller) ref.current = undefined; };
      }, [sessionId]);
      return ref;
    }
    function ImagePreview({ value, onClose, t }) {
      const ref = useRef(null);
      const [actual, setActual] = useState(false);
      useEffect(() => {
        const dialog = ref.current;
        dialog.showModal();
        const closed = () => onClose();
        dialog.addEventListener('close', closed);
        return () => { dialog.removeEventListener('close', closed); if (dialog.open) dialog.close(); };
      }, [onClose]);
      return h('dialog', { ref, className: 'ss-lightbox', 'aria-label': value.item.name, onClick: event => { if (event.target === event.currentTarget) ref.current.close(); } },
        h('div', { className: 'ss-lightbox-inner' },
          h('div', { className: 'ss-preview-toolbar' }, h('strong', null, value.item.name), button(t('sources.zoom'), () => setActual(v => !v)), h('a', { className: 'ss-button', href: value.url, download: fileName(value.item) }, t('sources.download')), button(t('sources.close'), () => ref.current.close(), { autoFocus: true })),
          h('div', { className: 'ss-image-stage' }, h('img', { src: value.url, alt: value.item.name, className: actual ? 'ss-image-actual' : 'ss-image-fit' }))));
    }
    function SourceMessages({ item, sessionId, t, lifetime }) {
      const [loaded, setLoaded] = useState(null);
      const [error, setError] = useState('');
      const [busy, setBusy] = useState(-1);
      async function readSource(source) {
        const controller = lifetime.current;
        if (!controller) return;
        setBusy(source.seq); setError('');
        try {
          const value = await (await request(api('source', sessionId, item, source.seq), controller.signal)).json();
          if (!controller.signal.aborted) setLoaded(value);
        } catch (error) { if (!controller.signal.aborted) setError(`${t('sources.sourceFailed')}: ${error.message}`); }
        finally { if (!controller.signal.aborted) setBusy(-1); }
      }
      return h('div', { className: 'ss-sources' },
        h('div', { className: 'ss-source-heading' }, t('sources.sources'), ` · ${item.sources.length}`),
        item.sources.map((source, index) => h('button', { className: 'ss-source-row', key: source.seq, type: 'button', disabled: busy >= 0, onClick: () => readSource(source) },
          h('span', null, `${index === 0 ? t('sources.first') + ' · ' : ''}${when(source.time, t)}`),
          h('span', { className: 'ss-muted' }, source.snippet || t('sources.noText')))),
        error && h('div', { role: 'alert', className: 'ss-error' }, error),
        loaded && h('section', { className: 'ss-original', 'aria-label': t('sources.message') },
          h('div', { className: 'ss-source-heading' }, t('sources.message'), ` · #${loaded.seq}`),
          h('div', { className: 'ss-muted' }, when(loaded.time, t)),
          h('pre', null, loaded.text || t('sources.noText')),
          loaded.attachments.map((entry, index) => h('div', { key: index, className: 'ss-muted' }, `${t(`sources.${entry.kind}`)} · ${entry.name || entry.attachmentId}`)),
          h('p', { className: 'ss-limit' }, t('sources.jumpLimit'))));
    }
    function SourceRow({ item, sessionId, inputActions, useInput, ctx, t, onPreview, lifetime, refreshRevision }) {
      const [status, setStatus] = useState(item.invalid ? { available: false } : null);
      const [retry, setRetry] = useState(0);
      const [expanded, setExpanded] = useState(false);
      const [busy, setBusy] = useState(false);
      const [notice, setNotice] = useState('');
      const downloads = useRef(new Map());
      useEffect(() => () => { for (const [url, timer] of downloads.current) { clearTimeout(timer); URL.revokeObjectURL(url); } downloads.current.clear(); }, []);
      const phase = useInput(state => state?.phase);
      const locked = phase === 'adjudicating' || phase === 'submitting';
      const isLink = item.kind === 'link';
      const url = !isLink && !item.invalid ? api('asset', sessionId, item) : '';
      useEffect(() => {
        if (isLink || item.invalid) return;
        const controller = new AbortController();
        setStatus(null);
        request(api('status', sessionId, item), controller.signal).then(response => response.json()).then(setStatus, error => { if (!controller.signal.aborted) setStatus({ available: false, error: error.message }); });
        return () => controller.abort();
      }, [sessionId, item.id, retry, refreshRevision]);
      async function action(fn) {
        const controller = lifetime.current;
        if (!controller || busy) return;
        setBusy(true); setNotice('');
        try { await fn(controller); }
        catch (error) { if (!controller.signal.aborted) setNotice(`${t('sources.actionFailed')}: ${error.message}`); }
        finally { if (!controller.signal.aborted) setBusy(false); }
      }
      function download() { return action(async controller => {
        const blob = await (await request(url, controller.signal)).blob();
        if (controller.signal.aborted) return;
        const objectUrl = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = objectUrl; anchor.download = fileName(item); anchor.click();
        downloads.current.set(objectUrl, setTimeout(() => { URL.revokeObjectURL(objectUrl); downloads.current.delete(objectUrl); }, 30_000));
        setNotice(t('sources.downloaded'));
      }); }
      function attach() { return action(async controller => {
        const generation = ctx.sessions.binding(sessionId);
        const conversation = ctx.get('conversation');
        if (!conversation?.createDrafts || !inputActions?.addAttachments || locked) throw new Error(t('sources.inputLocked'));
        const blob = await (await request(url, controller.signal)).blob();
        if (controller.signal.aborted || ctx.sessions.binding(sessionId) !== generation || ctx.sidebarRight.mounted.getSnapshot() !== sessionId) return;
        const file = new File([blob], fileName(item), { type: item.kind === 'image' ? item.attachment.mediaType : 'application/octet-stream' });
        const drafts = conversation.createDrafts(sessionId, [file]);
        if (!inputActions.addAttachments(drafts.map(draft => draft.id))) {
          for (const draft of drafts) conversation.releaseDraftAttachment(draft.id);
          throw new Error(t('sources.inputLocked'));
        }
        setNotice(t('sources.attached'));
      }); }
      function copy() { return action(async () => {
        if (!navigator.clipboard?.writeText) throw new Error(t('sources.clipboardFailed'));
        await navigator.clipboard.writeText(item.url); setNotice(t('sources.copied'));
      }); }
      function preview() { return action(async () => {
        if (item.kind === 'image') onPreview({ item, url });
        else if (status?.previewAddress) ctx.sidebarRight.openResource(status.previewAddress);
      }); }
      const unavailable = item.invalid || status?.available === false;
      const ref = item.attachment;
      const metadata = isLink ? '' : [item.kind === 'image' && ref?.width ? `${ref.width} × ${ref.height}` : ref?.name?.split('.').at(-1)?.toUpperCase(), sizeOf(ref?.bytes)].filter(Boolean).join(' · ');
      return h('article', { className: 'ss-item', 'data-source-kind': item.kind, 'data-source-unavailable': unavailable ? 'true' : undefined },
        h('div', { className: 'ss-item-top' },
          item.kind === 'image' && !unavailable ? h('button', { className: 'ss-thumbnail', type: 'button', 'aria-label': `${t('sources.preview')} ${item.name}`, onClick: preview }, h('img', { src: url, alt: item.name, loading: 'lazy', onError: () => setStatus({ available: false }) })) : h('div', { className: 'ss-kind-icon' }, glyph(item.kind, 24)),
          h('div', { className: 'ss-item-info' }, h('div', { className: 'ss-item-name', title: item.name }, item.name),
            isLink && h('div', { className: 'ss-url', title: item.url }, item.url),
            h('div', { className: 'ss-muted ss-type' }, t(`sources.${item.kind}`), metadata && ` · ${metadata}`),
            h('div', { className: 'ss-muted' }, when(item.sources[0]?.time, t)))),
        unavailable && h('div', { className: 'ss-error' }, t(item.invalid ? 'sources.invalid' : 'sources.unavailable')),
        h('div', { className: 'ss-item-actions' },
          isLink ? h(React.Fragment, null, h('a', { className: 'ss-button', href: item.url, target: '_blank', rel: 'noopener noreferrer', title: t('sources.openFailed') }, t('sources.open')), button(t('sources.copy'), copy, { disabled: busy })) : h(React.Fragment, null,
            (item.kind === 'image' || status?.previewAddress) && button(t('sources.preview'), preview, { disabled: unavailable || busy }),
            button(t('sources.download'), download, { disabled: unavailable || busy }),
            button(t('sources.attach'), attach, { disabled: unavailable || busy || locked }),
            unavailable && !item.invalid && button(t('sources.retry'), () => setRetry(value => value + 1))),
          button(`${t('sources.viewSource')}${item.sources.length > 1 ? ` (${item.sources.length})` : ''}`, () => setExpanded(value => !value), { 'aria-expanded': expanded })),
        (busy || notice) && h('div', { className: 'ss-notice', role: 'status' }, busy ? t('sources.busy') : notice),
        expanded && h(SourceMessages, { item, sessionId, t, lifetime }));
    }
    function createComponents(ctx, t) {
      function Header({ sessionId, useProjection, t }) {
        const count = useProjection(KEY, value => value?.order?.length ?? 0);
        return h('button', { type: 'button', className: 'ss-header-button', 'aria-label': t('sources.title'), title: t('sources.title'), onClick: () => { ctx.sidebarRight.openTab(KIND); } }, glyph('file', 16), h('span', null, t('sources.entry')), count > 0 && h('span', { className: 'ss-count' }, count));
      }
      function Panel(props) {
        const { sessionId, useProjection, t } = props;
        const state = useProjection(KEY);
        const [filter, setFilter] = useState('all');
        const [query, setQuery] = useState('');
        const [error, setError] = useState('');
        const [preview, setPreview] = useState(null);
        const [refreshRevision, setRefreshRevision] = useState(0);
        const lifetime = useLifetime(sessionId);
        const closePreview = React.useCallback(() => setPreview(null), []);
        async function refresh() {
          setError('');
          try { await ctx.sessions.refreshProjections(sessionId); setRefreshRevision(value => value + 1); }
          catch (error) { if (lifetime.current) setError(error.message); }
        }
        useEffect(() => { refresh(); }, [sessionId]);
        const items = useMemo(() => state?.order?.map(id => state.items[id]).filter(Boolean) ?? [], [state]);
        const counts = useMemo(() => ({ all: items.length, image: items.filter(item => item.kind === 'image').length, file: items.filter(item => item.kind === 'file').length, link: items.filter(item => item.kind === 'link').length }), [items]);
        const needle = query.trim().toLocaleLowerCase();
        const visible = items.filter(item => (filter === 'all' || item.kind === filter) && (!needle || `${item.name}\n${item.url ?? ''}`.toLocaleLowerCase().includes(needle)));
        return h('section', { className: 'ss-panel', 'aria-label': t('sources.title') },
          h('div', { className: 'ss-panel-heading' }, h('div', null, h('h2', null, t('sources.title')), h('p', null, t('sources.subtitle'))), button('↻', refresh, { title: t('sources.refresh'), 'aria-label': t('sources.refresh') })),
          h('div', { className: 'ss-filters', role: 'group', 'aria-label': t('sources.title') }, ['all', 'image', 'file', 'link'].map(value => button(`${t(`sources.${value}`)} ${counts[value]}`, () => setFilter(value), { key: value, 'aria-pressed': filter === value }))),
          h('input', { type: 'search', className: 'ss-search', value: query, placeholder: t('sources.search'), 'aria-label': t('sources.search'), onChange: event => setQuery(event.target.value) }),
          h('div', { className: 'ss-scope-note' }, t('sources.scopeNote')),
          error && h('div', { className: 'ss-error', role: 'alert' }, `${t('sources.failed')} ${error}`),
          state?.warnings > 0 && h('div', { className: 'ss-error', role: 'status' }, t('sources.recoveryWarning')),
          h('div', { className: 'ss-list' },
            state === undefined ? h('p', { className: 'ss-empty', role: 'status' }, error ? t('sources.failed') : t('sources.loading')) : visible.length === 0 ? h('div', { className: 'ss-empty' }, glyph('file', 36), h('strong', null, items.length ? t('sources.noResults') : t('sources.empty')), !items.length && h('p', null, t('sources.emptyDetail'))) : visible.map(item => h(SourceRow, { ...props, key: `${sessionId}:${item.id}`, item, ctx, onPreview: setPreview, lifetime, refreshRevision }))),
          preview && h(ImagePreview, { value: preview, onClose: closePreview, t }));
      }
      function ManagedPanel({ scope }) {
        const sessionId = scope.sessionId;
        const binding = ctx.sessions.binding(sessionId);
        const conversation = ctx.get('conversation');
        if (!binding || !conversation?.input?.for) return null;
        const input = conversation.input.for(binding.ctx);
        const useProjection = (key, select = value => value) => {
          const face = binding.session.projections.faceOf(key);
          return select(React.useSyncExternalStore(face.subscribe, face.getSnapshot, face.getSnapshot));
        };
        const useInput = (select = value => value) => {
          return select(React.useSyncExternalStore(input.state.subscribe, input.state.getSnapshot, input.state.getSnapshot));
        };
        return h(Panel, { key: sessionId, sessionId, useProjection, useInput, inputActions: input.actions, t });
      }
      return { Header, Panel, ManagedPanel };
    }
    return {
      inject: ['slots', 'locale', 'sessions', 'sidebarRight', 'sidebarRightTabs'],
      apply(ctx) {
        const dictionaries = Object.fromEntries(Object.entries(DICTS).map(([locale, dict]) => [locale, Object.fromEntries(Object.entries(dict).filter(([key, value]) => key !== 'meta' && typeof value === 'string'))]));
        ctx.effect(() => ctx.locale.register(NS, dictionaries));
        const t = ctx.locale.bind(NS);
        const { Header, Panel, ManagedPanel } = createComponents(ctx, t);
        let nativeRegistration;
        let nativeManaged;
        // Register the native fallback once, then replace it with a guideless
        // registration when betterSidebar is (or becomes) available. The
        // managed tab owns the Start card; a native guide beside it would
        // render the same "会话资料" entry twice.
        function registerNative() {
          const hasManaged = ctx.get('betterSidebar') !== undefined;
          if (nativeRegistration !== undefined && nativeManaged === hasManaged) return;
          nativeManaged = hasManaged;
          nativeRegistration?.();
          nativeRegistration = ctx.sidebarRightTabs.register({
            id: ID,
            kind: KIND,
            title: () => t('sources.title'),
            ...(hasManaged ? {} : { guide: [{ id: 'sources', title: () => t('sources.title'), description: () => t('sources.subtitle'), icon: () => glyph('file', 20) }] }),
          });
        }
        ctx.inject(['betterSidebar'], scope => {
          scope.effect(() => scope.betterSidebar.registerTab({
            id: MANAGED_KIND,
            title: () => t('sources.title'),
            description: () => t('sources.subtitle'),
            icon: size => glyph('file', size),
            single: true,
            component: ManagedPanel,
          }));
          registerNative();
        });
        ctx.effect(() => {
          registerNative();
          return () => nativeRegistration?.();
        });
        ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register({ name: 'conversation.session.header.utilities', id: 'session-sources', order: 5, locale: NS }, Header));
        ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register({ name: 'sidebar.right.pane.tab', key: ID, locale: NS }, Panel));
        ctx.slots.inject('sidebar.right.pane.tab.title', () => ctx.slots.register({ name: 'sidebar.right.pane.tab.title', key: ID, locale: NS }, ({ t }) => h('span', { className: 'ss-tab-title' }, glyph('file', 14), t('sources.title'))));
        // Styles belong to this plugin; unload removes them with the registration lifetime.
        ctx.effect(() => {
          const element = document.createElement('style');
          element.dataset.plugin = ID; element.textContent = css; document.head.appendChild(element);
          return () => element.remove();
        });
      },
    };
  },
});
