import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Script } from 'node:vm';
import test from 'node:test';

async function loadClient() {
  let definition;
  const window = { __ModuleLoader__: { load(value) { definition = value; } } };
  const React = {
    Fragment: Symbol('Fragment'),
    createElement(type, props, ...children) { return { type, key: props?.key, props: { ...props, children } }; },
    useState(initial) { return [initial, () => {}]; },
    useEffect() {},
    useRef(initial) { return { current: initial }; },
    useMemo(factory) { return factory(); },
    useCallback(factory) { return factory; },
    useSyncExternalStore(_subscribe, getSnapshot) { return getSnapshot(); },
  };
  const document = { createElement: () => ({ dataset: {}, remove() {} }), head: { appendChild() {} } };
  new Script(await readFile(new URL('../client.js', import.meta.url), 'utf8')).runInNewContext({ window, document });
  return definition.factory(name => {
    assert.equal(name, 'react');
    return React;
  });
}

function fixture(managed = true) {
  const descriptors = [];
  const nativeTabs = [];
  const nativeActive = [];
  const inputs = new Map();
  const bindings = new Map();
  let available = managed;
  for (const sessionId of ['session-a', 'session-b']) {
    const state = { sessionId, order: [`${sessionId}-item`], items: {} };
    const projection = { getSnapshot: () => state, subscribe: () => () => {} };
    const inputState = { getSnapshot: () => ({ phase: 'idle', sessionId }), subscribe: () => () => {} };
    const actions = { addAttachments: () => true };
    const scopeCtx = { sessionId };
    bindings.set(sessionId, {
      ctx: scopeCtx,
      session: { projections: { faceOf: key => { assert.equal(key, 'sessionSources'); return projection; } } },
    });
    inputs.set(scopeCtx, { state: inputState, actions });
  }
  const scope = {
    betterSidebar: { registerTab(descriptor) { descriptors.push(descriptor); return () => descriptor.disposed = true; } },
    effect(callback) { ctx.managedDisposer = callback(); return ctx.managedDisposer; },
  };
  const ctx = {
    sessions: { binding: id => bindings.get(id), refreshProjections: async () => {} },
    locale: { register: () => () => {}, bind: () => key => key },
    sidebarRightTabs: {
      register(descriptor) {
        nativeTabs.push(descriptor);
        nativeActive.push(descriptor);
        return () => {
          const index = nativeActive.indexOf(descriptor);
          if (index >= 0) nativeActive.splice(index, 1);
          descriptor.disposed = true;
        };
      },
    },
    slots: { inject() {} },
    inject(names, callback) {
      assert.equal(names.length, 1);
      assert.equal(names[0], 'betterSidebar');
      ctx.activateBetterSidebar = () => callback(scope);
      if (available) ctx.activateBetterSidebar();
    },
    effect(callback) { return callback(); },
    get(name) {
      if (name === 'betterSidebar') return available ? scope.betterSidebar : undefined;
      assert.equal(name, 'conversation');
      return { input: { for: scopeCtx => inputs.get(scopeCtx) } };
    },
  };
  return {
    ctx,
    descriptors,
    nativeTabs,
    nativeActive,
    enableBetterSidebar() { available = true; ctx.activateBetterSidebar(); },
  };
}

test('registers one managed Start entry and keeps a guideless native fallback', async () => {
  const client = await loadClient();
  const { ctx, descriptors, nativeActive } = fixture();
  client.apply(ctx);
  assert.equal(descriptors.length, 1);
  const descriptor = descriptors[0];
  assert.equal(descriptor.id, 'session-sources-managed');
  assert.equal(descriptor.title(), 'sources.title');
  assert.equal(descriptor.description(), 'sources.subtitle');
  assert.equal(descriptor.single, true);
  assert.equal(nativeActive.length, 1);
  assert.equal(nativeActive[0].kind, 'session-sources');
  assert.equal(nativeActive[0].guide, undefined);
});

test('keeps the native Start entry when betterSidebar is unavailable', async () => {
  const client = await loadClient();
  const { ctx, descriptors, nativeActive } = fixture(false);
  client.apply(ctx);
  assert.equal(descriptors.length, 0);
  assert.equal(nativeActive.length, 1);
  assert.equal(nativeActive[0].kind, 'session-sources');
  assert.equal(nativeActive[0].guide[0].id, 'sources');
});

test('removes the native Start entry if betterSidebar arrives later', async () => {
  const client = await loadClient();
  const { ctx, descriptors, nativeActive, enableBetterSidebar } = fixture(false);
  client.apply(ctx);
  assert.equal(descriptors.length, 0);
  assert.equal(nativeActive[0].guide[0].id, 'sources');
  enableBetterSidebar();
  assert.equal(descriptors.length, 1);
  assert.equal(nativeActive.length, 1);
  assert.equal(nativeActive[0].guide, undefined);
});

test('managed tab resolves projection and composer input from its own session scope', async () => {
  const client = await loadClient();
  const { ctx, descriptors } = fixture();
  client.apply(ctx);
  const component = descriptors[0].component;
  const a = component({ scope: { sessionId: 'session-a' } });
  const b = component({ scope: { sessionId: 'session-b' } });
  assert.equal(a.props.sessionId, 'session-a');
  assert.equal(b.props.sessionId, 'session-b');
  assert.equal(a.key, 'session-a');
  assert.equal(a.props.useProjection('sessionSources').order[0], 'session-a-item');
  assert.equal(b.props.useProjection('sessionSources').order[0], 'session-b-item');
  assert.equal(a.props.useInput().sessionId, 'session-a');
  assert.equal(b.props.useInput().sessionId, 'session-b');
  assert.notEqual(a.props.inputActions, b.props.inputActions);
});

test('managed registration follows the optional service disposer', async () => {
  const client = await loadClient();
  const { ctx, descriptors } = fixture();
  client.apply(ctx);
  const dispose = ctx.managedDisposer;
  assert.equal(typeof dispose, 'function');
  dispose();
  assert.equal(descriptors[0].disposed, true);
});
