window.__ModuleLoader__.load({
  id: '@local/dsh-session-sources',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { useState, useEffect, useRef, useMemo } = React;
    const DICTS = __SESSION_SOURCES_DICTS__;
    const NS = 'sessionSources';
    const KIND = 'session-sources';
    const MANAGED_KIND = 'session-sources-managed';
    const ID = '@local/dsh-session-sources';
    const KEY = 'sessionSources';
    const css = __SESSION_SOURCES_CSS__;
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
        ctx.inject(['betterSidebar'], scope => {
          scope.effect(() => scope.betterSidebar.registerTab({
            id: MANAGED_KIND,
            title: () => t('sources.title'),
            description: () => t('sources.subtitle'),
            icon: size => glyph('file', size),
            single: true,
            component: ManagedPanel,
          }));
        });
        ctx.effect(() => ctx.sidebarRightTabs.register({ id: ID, kind: KIND, title: () => t('sources.title'), guide: [{ id: 'sources', title: () => t('sources.title'), description: () => t('sources.subtitle'), icon: () => glyph('file', 20) }] }));
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
