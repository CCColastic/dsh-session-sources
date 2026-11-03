import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createSourcesService, registerSourcesRoutes } from '../src/server.js';
import { rebuildSources } from '../src/indexer.js';
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=', 'base64');
const text = Buffer.from('file body\n');
const image = { attachmentId: `sha256:${'a'.repeat(64)}`, mediaType: 'image/png', bytes: png.length, width: 1, height: 1, name: '图片.png' };
const file = { attachmentId: `sha256:${'b'.repeat(64)}`, bytes: text.length, name: 'notes.txt' };
const missing = { attachmentId: `sha256:${'c'.repeat(64)}`, bytes: 4, name: 'missing.txt' };
const events = [{ type: 'user/message', seq: 3, time: 1700000000000, data: { role: 'user', id: 'm1', source: { kind: 'user' }, content: [{ type: 'image', attachment: image }, { type: 'file', attachment: file }, { type: 'file', attachment: missing }, { type: 'text', text: 'A source message https://example.test' }] } }];
async function fixture(t) {
  const dir = await mkdtemp(join(tmpdir(), 'session-sources-test-'));
  await writeFile(join(dir, 'image'), png);
  await writeFile(join(dir, 'notes.txt'), text);
  t.after(async () => { assert.equal(resolve(dir), dir); assert.ok(dir.startsWith(join(tmpdir(), 'session-sources-test-'))); await rm(dir, { recursive: true, force: true }); });
  const state = rebuildSources(events);
  const live = { id: 'session-A', eventAt: seq => events.find(event => event.seq === seq), snapshotEvents: () => events };
  const calls = { image: 0, file: 0, inspect: 0 };
  const routes = new Map();
  const ctx = {
    sessions: { get: id => id === 'session-A' ? live : undefined },
    sessionProjections: { stateOf: () => state },
    sessionController: { inspect: async id => { calls.inspect++; return { events: id === 'session-old' ? events : [] }; } },
    attachments: {
      imageHostPath: () => join(dir, 'image'), fileHostPath: ref => join(dir, ref.name),
      readImage: async (ref, signal) => { calls.image++; assert.equal(ref.attachmentId, image.attachmentId); return { ref, data: await readFile(join(dir, 'image'), { signal }) }; },
      async *readFileStream(ref) { calls.file++; yield await readFile(join(dir, ref.name)); },
    },
    connection: {
      admit: ({ headers }) => headers.get('X-Test-Owner') === 'yes' ? { peer: { principal: { kind: 'owner' } } } : { rejection: 401 },
      fetch: { async register(route) { routes.set(route.path, route); return async () => routes.delete(route.path); } },
    },
  };
  return { ctx, calls, state, routes, dir, service: createSourcesService(ctx) };
}
function key(kind, ref) { return `${kind}:${ref.attachmentId}`; }

test('image reads use image API and preserve exact normalized bytes', async t => {
  const { service, calls } = await fixture(t);
  const response = await service.asset('session-A', key('image', image));
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), png);
  assert.equal(response.headers.get('Content-Type'), 'image/png');
  assert.match(response.headers.get('Content-Disposition'), /filename\*=UTF-8/);
  assert.equal(calls.image, 1); assert.equal(calls.file, 0);
});
test('ordinary file downloads use streamed file API, not image storage', async t => {
  const { service, calls } = await fixture(t);
  const response = await service.asset('session-A', key('file', file));
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), text);
  assert.equal(response.headers.get('Content-Type'), 'application/octet-stream');
  assert.equal(calls.file, 1); assert.equal(calls.image, 0);
});
test('missing original is isolated and surviving file remains readable', async t => {
  const { service } = await fixture(t);
  await assert.rejects(service.status('session-A', key('file', missing)), { code: 'ENOENT' });
  assert.equal((await service.status('session-A', key('file', file))).available, true);
});
test('membership check prevents cross-session asset and source reads', async t => {
  const { service } = await fixture(t);
  await assert.rejects(service.asset('session-B', key('file', file)), { status: 404 });
  await assert.rejects(service.source('session-B', key('file', file), 3), { status: 404 });
  await assert.rejects(service.asset('../session-A', key('file', file)), { status: 400 });
});
test('pre-install/cold history recovers without resuming an Agent', async t => {
  const { service, calls } = await fixture(t);
  assert.equal((await service.readSession('session-old')).state.order.length, 4);
  assert.equal(calls.inspect, 1);
  assert.deepEqual(Buffer.from(await (await service.asset('session-old', key('file', file))).arrayBuffer()), text);
});
test('source lookup is authorized by actual indexed occurrence', async t => {
  const { service } = await fixture(t);
  assert.equal((await service.source('session-A', key('image', image), 3)).text, 'A source message https://example.test');
  await assert.rejects(service.source('session-A', key('image', image), 999), { status: 404 });
});
test('file status offers a session-scoped native preview resource', async t => {
  const { service } = await fixture(t);
  const status = await service.status('session-A', key('file', file));
  assert.ok(status.previewAddress.startsWith('dsh-resource://file/session/session-A/'));
  assert.ok(status.previewAddress.endsWith('/notes.txt'));
  assert.equal(status.integrity, 'not-checked');
});
test('registered browser endpoints enforce authentication and clean up on unload', async t => {
  const { ctx, service, routes } = await fixture(t);
  const dispose = await registerSourcesRoutes(ctx, service);
  const route = routes.get('/api/session-sources/status');
  const url = `http://localhost/api/session-sources/status?session=session-A&item=${encodeURIComponent(key('file', file))}`;
  assert.equal((await route.fetch(new Request(url))).status, 401);
  const response = await route.fetch(new Request(url, { headers: { 'X-Test-Owner': 'yes' } }));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).available, true);
  assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
  await dispose(); assert.equal(routes.size, 0);
});
test('missing files produce explicit API status while unrelated assets still succeed', async t => {
  const { ctx, service, routes } = await fixture(t);
  const dispose = await registerSourcesRoutes(ctx, service); t.after(dispose);
  const route = routes.get('/api/session-sources/status');
  const response = await route.fetch(new Request(`http://localhost/api/session-sources/status?session=session-A&item=${encodeURIComponent(key('file', missing))}`, { headers: { 'X-Test-Owner': 'yes' } }));
  assert.equal(response.status, 404);
  assert.equal((await response.json()).code, 'attachment-missing');
});
test('stream integrity failures propagate instead of reporting a successful download', async t => {
  const { ctx, service } = await fixture(t);
  ctx.attachments.readFileStream = async function* () { yield Buffer.from('bad'); throw new Error('integrity failure'); };
  await assert.rejects((await service.asset('session-A', key('file', file))).arrayBuffer(), /integrity failure/);
});
