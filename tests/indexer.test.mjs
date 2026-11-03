import test from 'node:test';
import assert from 'node:assert/strict';
import { initSources, applySources, rebuildSources, extractLinks, linkIdentity, getSourceItem } from '../src/indexer.js';
import { SourcesStateSchema } from '../index.js';
const hash = 'a'.repeat(64);
export const image = { attachmentId: `sha256:${hash}`, mediaType: 'image/png', bytes: 8, width: 2, height: 3, name: 'photo.png' };
export const file = { attachmentId: `sha256:${'b'.repeat(64)}`, name: 'notes.txt', bytes: 9 };
export function user(seq, content, id = `m${seq}`) { return { type: 'user/message', seq, time: 1700000000000 + seq, data: { id, role: 'user', source: { kind: 'user' }, content } }; }

test('A: image, ordinary file and explicit link yield three independently typed items', () => {
  const state = rebuildSources([user(0, [{ type: 'image', attachment: image }, { type: 'file', attachment: file }, { type: 'text', text: 'https://example.test/a?x=1&y=2' }])]);
  assert.deepEqual(state.order.map(id => state.items[id].kind), ['image', 'file', 'link']);
  assert.equal(state.items[state.order[0]].attachment.width, 2);
  assert.equal(state.items[state.order[1]].attachment.bytes, 9);
  assert.deepEqual(SourcesStateSchema.parse(state), state);
});
test('B: independent empty session cannot contain any A references', () => {
  const state = rebuildSources([user(0, [{ type: 'image', attachment: image }])]);
  assert.equal(state.order.length, 1);
  assert.deepEqual(rebuildSources([user(0, [{ type: 'text', text: 'hello' }])]), initSources());
});
test('append drive, cold replay and JSON checkpoint-tail replay are equivalent', () => {
  const events = [user(0, [{ type: 'image', attachment: image }]), user(1, [{ type: 'file', attachment: file }]), user(2, [{ type: 'text', text: '[Site](https://example.test/path)' }])];
  const initial = rebuildSources(events.slice(0, 2));
  const restored = JSON.parse(JSON.stringify(initial));
  assert.deepEqual(applySources(restored, events[2]), rebuildSources(events));
  assert.deepEqual(initial.order.length, 2);
});
test('same attachment deduplicates while all repeated messages remain traceable', () => {
  const state = rebuildSources([user(0, [{ type: 'image', attachment: image }, { type: 'image', attachment: image }]), user(10, [{ type: 'image', attachment: image }])]);
  assert.equal(state.order.length, 1);
  assert.deepEqual(state.items[state.order[0]].sources.map(source => source.seq), [0, 10]);
});
test('offload/replacement replay of the same message id does not invent an occurrence', () => {
  const state = rebuildSources([user(0, [{ type: 'image', attachment: image }], 'same'), user(5, [{ type: 'image', attachment: image, offloaded: true }], 'same')]);
  assert.equal(state.items[state.order[0]].sources.length, 1);
  assert.equal(state.items[state.order[0]].sources[0].seq, 0);
});
test('fork inherits only its visible copied prefix; descendants are not merged', () => {
  const events = [user(0, [{ type: 'image', attachment: image }]), user(4, [{ type: 'file', attachment: file }])];
  const fork = rebuildSources([...events.slice(0, 1), user(1, [{ type: 'text', text: 'https://branch.test' }])]);
  assert.deepEqual(fork.order.map(id => fork.items[id].kind), ['image', 'link']);
  assert.equal(rebuildSources([]).order.length, 0);
});
test('model answers, tools, developer messages and non-human user events are ignored by identity', () => {
  const state = initSources();
  for (const event of [
    { type: 'assistant/message', data: { message: { content: [{ type: 'text', text: 'https://spam.test' }] } } },
    { type: 'tool/result', data: { message: { content: [{ type: 'image', attachment: image }] } } },
    { type: 'developer/message', data: {} },
    { ...user(1, [{ type: 'text', text: 'https://child.test' }]), data: { ...user(1, []).data, source: { kind: 'subagent' }, content: [{ type: 'image', attachment: image }] } },
    { type: 'step/end', seq: 3, data: {} },
  ]) assert.equal(applySources(state, event), state);
});
test('invalid attachment metadata is isolated; valid links and files remain usable', () => {
  const state = rebuildSources([user(0, [{ type: 'image', attachment: { attachmentId: '../bad' } }, { type: 'file', attachment: file }, { type: 'text', text: 'https://good.test' }])]);
  assert.equal(state.warnings, 1);
  assert.equal(state.order.length, 3);
  assert.equal(state.items[state.order[0]].invalid, true);
  assert.equal(state.items[state.order[1]].invalid, undefined);
  SourcesStateSchema.parse(state);
});
test('malformed message content and sequence warn without poisoning subsequent entries', () => {
  const state = rebuildSources([user(0, null), user(NaN, []), user(2, [{ type: 'text', text: 'https://valid.test' }])]);
  assert.equal(state.warnings, 2);
  assert.equal(state.order.length, 1);
  SourcesStateSchema.parse(state);
});
test('conservative identity preserves query parameters, ordering, fragments and slashes', () => {
  const links = ['https://a.test/p?x=1&y=2', 'https://a.test/p?y=2&x=1', 'https://a.test/p?x=2&y=2', 'https://a.test/p#one', 'https://a.test/p#two', 'https://a.test/p', 'https://a.test/p/'];
  assert.deepEqual(extractLinks(links.join(' ')).map(item => item.url), links);
  assert.equal(linkIdentity('javascript:alert(1)'), null);
  assert.equal(linkIdentity('file:///secret'), null);
});
test('Markdown destinations keep a reliable display label and balanced parentheses', () => {
  assert.deepEqual(extractLinks('[Guide](https://a.test/wiki/Test_(one))'), [{ url: 'https://a.test/wiki/Test_(one)', title: 'Guide' }]);
  assert.deepEqual(extractLinks('[Guide](<https://a.test/path?q=1> "title")'), [{ url: 'https://a.test/path?q=1', title: 'Guide' }]);
});
test('Markdown and bare occurrences of same URL merge once per message', () => {
  assert.deepEqual(extractLinks('https://a.test/p [Label](https://a.test/p)'), [{ url: 'https://a.test/p', title: 'Label' }]);
});
test('bare links trim surrounding sentence brackets but preserve query punctuation', () => {
  assert.equal(extractLinks('See (https://a.test/path).')[0].url, 'https://a.test/path');
  assert.equal(extractLinks('访问 https://a.test/path。谢谢')[0].url, 'https://a.test/path');
  assert.equal(extractLinks('https://a.test/?value=.,;?')[0].url, 'https://a.test/?value=.,;?');
  assert.equal(extractLinks('<https://a.test/path.>')[0].url, 'https://a.test/path.');
});
test('query and fragment brackets or apostrophes remain exact, including explicit autolinks', () => {
  for (const suffix of ['?q=)', '?q=]', "?q='quoted'", '#part)']) {
    const url = `https://e.test/${suffix}`;
    assert.equal(extractLinks(url)[0].url, url);
    assert.equal(extractLinks(`<${url}>`)[0].url, url);
  }
});
test('optional Markdown title does not replace the reliable link label', () => {
  assert.deepEqual(extractLinks('[label](https://e.test/a "title")'), [{ url: 'https://e.test/a', title: 'label' }]);
});
test('prototype names cannot escape index item lookup', () => {
  assert.equal(getSourceItem(initSources(), '__proto__'), undefined);
  assert.equal(getSourceItem(initSources(), 'constructor'), undefined);
});
