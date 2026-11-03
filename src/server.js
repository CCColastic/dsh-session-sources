import { stat } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { PROJECTION_KEY, getSourceItem, rebuildSources, sourceMessage } from './indexer.js';

const ROOT = '/api/session-sources';
const PRIVATE = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' };
const json = (value, status = 200) => Response.json(value, { status, headers: PRIVATE });
function safeError(error) {
  const code = error?.code === 'ENOENT' ? 'attachment-missing' : error?.name === 'AbortError' ? 'cancelled' : 'attachment-unavailable';
  return { code, message: code === 'attachment-missing' ? 'The stored attachment is missing.' : 'The attachment cannot be read or verified.' };
}
function downloadName(item) {
  const extension = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif' }[item.attachment.mediaType];
  const raw = (item.name || 'attachment').replace(/[\u0000-\u001f\u007f/\\]/g, '_');
  return item.kind === 'image' && !/\.[a-z0-9]{1,8}$/i.test(raw) ? `${raw}.${extension}` : raw;
}

/** Read-only application service, shared by browser endpoints and integration tests. */
export function createSourcesService(ctx) {
  async function readSession(id) {
    if (typeof id !== 'string' || !id || id.length > 256 || /[\u0000-\u001f/\\]/u.test(id)) throw Object.assign(new Error('Invalid session identity'), { status: 400 });
    const live = ctx.sessions.get(id);
    if (live) return {
      state: ctx.sessionProjections.stateOf(live, PROJECTION_KEY) ?? rebuildSources(live.snapshotEvents()),
      eventAt: seq => live.eventAt(seq),
    };
    // inspect() does not resume an Agent or call a model. It also supplies inherited fork events.
    const inspection = await ctx.sessionController.inspect(id);
    return { state: rebuildSources(inspection.events), eventAt: seq => inspection.events.find(event => event.seq === seq) };
  }
  async function resolve(id, key) {
    const session = await readSession(id);
    const item = getSourceItem(session.state, key);
    if (!item || item.kind === 'link') throw Object.assign(new Error('Attachment not referenced by this session'), { status: 404 });
    if (item.invalid || !item.attachment) throw Object.assign(new Error('Invalid attachment record'), { status: 422 });
    return item;
  }
  async function status(id, key, signal) {
    const item = await resolve(id, key);
    const ref = item.attachment;
    const path = item.kind === 'image' ? ctx.attachments.imageHostPath(ref) : ctx.attachments.fileHostPath(ref);
    if (path) {
      const info = await stat(path, { signal });
      if (!info.isFile() || info.size !== ref.bytes) throw new Error('Attachment size differs from its recorded reference');
      const pathParts = path.replace(/\\/g, '/').split('/').map(part => /^[A-Za-z]:$/.test(part) ? part : encodeURIComponent(part)).join('/');
      const previewAddress = item.kind === 'file' ? `dsh-resource://file/session/${encodeURIComponent(id)}/${pathParts}` : undefined;
      return { available: true, integrity: 'not-checked', bytes: info.size, ...(previewAddress ? { previewAddress } : {}) };
    }
    // Providers without host paths remain supported; only explicit reads verify their contents.
    return { available: null, integrity: 'not-checked', bytes: ref.bytes };
  }
  async function asset(id, key, signal) {
    const item = await resolve(id, key);
    await status(id, key, signal);
    const ref = item.attachment;
    const name = downloadName(item);
    const headers = {
      ...PRIVATE,
      'Content-Type': item.kind === 'image' ? ref.mediaType : 'application/octet-stream',
      'Content-Disposition': `attachment; filename="attachment"; filename*=UTF-8''${encodeURIComponent(name).replace(/['()*]/g, char => `%${char.charCodeAt(0).toString(16)}`)}`,
    };
    if (item.kind === 'image') {
      const stored = await ctx.attachments.readImage(ref, signal);
      return new Response(new Uint8Array(stored.data), { headers });
    }
    // Preserve backpressure; no complete-file buffer or additional on-disk copy.
    const stream = Readable.from(ctx.attachments.readFileStream(ref, signal));
    return new Response(Readable.toWeb(stream), { headers });
  }
  async function source(id, key, seq) {
    const session = await readSession(id);
    const item = getSourceItem(session.state, key);
    if (!Number.isSafeInteger(seq) || !item?.sources.some(source => source.seq === seq)) throw Object.assign(new Error('Source message not referenced by this item'), { status: 404 });
    const value = sourceMessage(session.eventAt(seq));
    if (!value) throw Object.assign(new Error('Source message is damaged or unavailable'), { status: 422 });
    return value;
  }
  return { readSession, resolve, status, asset, source };
}

export async function registerSourcesRoutes(ctx, service) {
  const disposers = [];
  for (const action of ['status', 'asset', 'source']) {
    disposers.push(await ctx.connection.fetch.register({
      path: `${ROOT}/${action}`, methods: ['GET'], requestBody: 'buffered',
      async fetch(request) {
        // Custom routes have no implicit Session resource declaration. Restrict this first version
        // to the authenticated owner Peer, then prove attachment membership in the addressed log.
        const admission = ctx.connection.admit({ headers: request.headers });
        if ('rejection' in admission) return json({ code: 'unauthorized' }, admission.rejection);
        if (admission.peer.principal.kind !== 'owner') return json({ code: 'forbidden' }, 403);
        const url = new URL(request.url);
        const id = url.searchParams.get('session');
        const key = url.searchParams.get('item');
        try {
          if (action === 'asset') return await service.asset(id, key, request.signal);
          if (action === 'source') return json(await service.source(id, key, Number(url.searchParams.get('seq'))));
          return json(await service.status(id, key, request.signal));
        } catch (error) {
          return json(safeError(error), error?.status ?? (error?.code === 'ENOENT' ? 404 : 422));
        }
      },
    }));
  }
  return async () => { for (const dispose of disposers.reverse()) await dispose(); };
}
