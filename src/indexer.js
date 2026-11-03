// Session logs are the authority. This fold never reads disks, network, tools, or model output.
export const PROJECTION_KEY = 'sessionSources';
export const STATE_VERSION = 1;
const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key);

export function initSources() { return { items: {}, order: [], warnings: 0 }; }
export function isHumanMessage(event) {
  return event?.type === 'user/message' && event.data?.role === 'user'
    && (event.data.source == null || event.data.source.kind === 'user');
}
export function linkIdentity(value) {
  if (typeof value !== 'string' || /[\s\u0000-\u001f]/u.test(value)) return null;
  try {
    const parsed = new URL(value);
    if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname) return null;
    // Deliberately retain the user's exact spelling, query order, fragment and trailing slash.
    return /^https?:\/\//i.test(value) ? value : null;
  } catch { return null; }
}
function unescapeMarkdown(value) { return value.replace(/\\([\\()[\]<>])/g, '$1'); }

/** Explicit destinations are parsed before bare URLs so their delimiters never alter query data. */
export function extractLinks(text) {
  if (typeof text !== 'string') return [];
  const results = [];
  const covered = [];
  const inside = at => covered.some(([start, end]) => at >= start && at < end);
  const markdown = /\[((?:\\.|[^\]\\\n])*)\]\(\s*(<?https?:\/\/)/gi;
  let match;
  while ((match = markdown.exec(text))) {
    const start = markdown.lastIndex - match[2].length;
    const angle = text[start] === '<';
    let cursor = start + (angle ? 1 : 0);
    const from = cursor;
    let depth = 0;
    for (; cursor < text.length; cursor++) {
      const char = text[cursor];
      if (char === '\\') { cursor++; continue; }
      if (angle ? char === '>' : char === ')' && depth === 0) break;
      if (!angle && /\s/.test(char)) break;
      if (char === '(') depth++;
      if (char === ')') depth--;
    }
    const value = unescapeMarkdown(text.slice(from, cursor));
    const tail = text.slice(cursor + (angle ? 1 : 0));
    const close = /^(?:\s+(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\)))?\s*\)/.exec(tail);
    if (close && (!angle || text[cursor] === '>') && linkIdentity(value)) {
      results.push({ url: value, title: unescapeMarkdown(match[1]).trim() || value, at: from });
      covered.push([from, cursor + (angle ? 1 : 0) + close[0].length]);
    }
    markdown.lastIndex = Math.max(markdown.lastIndex, cursor);
  }
  const autolink = /<(https?:\/\/[^<>\r\n]+)>/gi;
  while ((match = autolink.exec(text))) {
    const from = match.index + 1;
    if (!inside(from) && linkIdentity(match[1])) {
      results.push({ url: match[1], title: match[1], at: from });
      covered.push([from, autolink.lastIndex]);
    }
  }
  const bare = /https?:\/\/[^\s<>"`{}\u0000-\u001f，。；！？【】]+/gi;
  while ((match = bare.exec(text))) {
    if (inside(match.index)) continue;
    let value = match[0];
    if (text[match.index - 1] === "'" && value.endsWith("'")) value = value.slice(0, -1);
    // In an ambiguous bare URL, preserve query/fragment punctuation verbatim.
    if (!/[?#]/.test(value)) {
      let previous;
      do {
        previous = value;
        value = value.replace(/[.,;]+$/, '');
        for (const [open, close] of [['(', ')'], ['[', ']']]) {
          while (value.endsWith(close) && [...value].filter(c => c === close).length > [...value].filter(c => c === open).length) value = value.slice(0, -1);
        }
      } while (value !== previous);
    }
    if (linkIdentity(value)) results.push({ url: value, title: value, at: match.index });
  }
  results.sort((a, b) => a.at - b.at);
  const seen = new Map();
  for (const value of results) {
    const previous = seen.get(value.url);
    if (!previous || previous.title === previous.url && value.title !== value.url) seen.set(value.url, value);
  }
  return [...seen.values()].map(({ url, title }) => ({ url, title }));
}

export function validAttachment(kind, ref) {
  if (!ref || typeof ref !== 'object' || !/^sha256:[a-f0-9]{64}$/i.test(ref.attachmentId ?? '')) return false;
  if (!Number.isSafeInteger(ref.bytes) || ref.bytes < 0) return false;
  if (kind === 'image') return IMAGE_TYPES.has(ref.mediaType) && Number.isSafeInteger(ref.width) && ref.width > 0 && Number.isSafeInteger(ref.height) && ref.height > 0;
  return kind === 'file' && typeof ref.name === 'string';
}
function copyRef(kind, ref) {
  const value = { attachmentId: ref.attachmentId, bytes: ref.bytes };
  if (typeof ref.name === 'string') value.name = ref.name;
  if (kind === 'image') {
    Object.assign(value, { mediaType: ref.mediaType, width: ref.width, height: ref.height });
    if (Number.isSafeInteger(ref.originalDimensions?.width) && Number.isSafeInteger(ref.originalDimensions?.height)) value.originalDimensions = { width: ref.originalDimensions.width, height: ref.originalDimensions.height };
  }
  return value;
}

export function applySources(state, event) {
  if (!isHumanMessage(event)) return state;
  if (!Number.isSafeInteger(event.seq) || event.seq < 0) return { ...state, warnings: state.warnings + 1 };
  const content = event.data.content;
  if (!Array.isArray(content)) return { ...state, warnings: state.warnings + 1 };
  const texts = content.filter(part => part?.type === 'text' && typeof part.text === 'string').map(part => part.text);
  const source = {
    seq: event.seq,
    time: Number.isFinite(event.time) ? event.time : 0,
    messageId: typeof event.data.id === 'string' ? event.data.id : `seq:${event.seq}`,
    snippet: texts.join('\n').slice(0, 180),
  };
  let items = state.items;
  let order = state.order;
  let warnings = state.warnings;
  const add = (entry) => {
    const previous = items[entry.id];
    if (previous?.sources.some(item => item.messageId === source.messageId)) return;
    if (items === state.items) items = { ...items };
    if (!previous) {
      if (order === state.order) order = [...order];
      order.push(entry.id);
    }
    const sources = [...(previous?.sources ?? []), source];
    items[entry.id] = { ...entry, ...(previous ?? {}), sources };
  };
  for (let partIndex = 0; partIndex < content.length; partIndex++) {
    const part = content[partIndex];
    if (part?.type !== 'image' && part?.type !== 'file') continue;
    const kind = part.type;
    if (!validAttachment(kind, part.attachment)) {
      warnings++;
      add({ id: `invalid:${event.seq}:${partIndex}`, kind, name: typeof part.attachment?.name === 'string' ? part.attachment.name : kind, invalid: true });
      continue;
    }
    const ref = copyRef(kind, part.attachment);
    add({ id: `${kind}:${ref.attachmentId}`, kind, name: ref.name || `${kind}-${ref.attachmentId.slice(7, 19)}`, attachment: ref });
  }
  for (const text of texts) for (const link of extractLinks(text)) add({ id: `link:${link.url}`, kind: 'link', name: link.title, url: link.url });
  return items === state.items && warnings === state.warnings ? state : { items, order, warnings };
}
export function sourcesView(state) { return state; }
export function rebuildSources(events) { return events.reduce(applySources, initSources()); }
export function getSourceItem(state, id) { return typeof id === 'string' && own(state.items, id) ? state.items[id] : undefined; }
export function sourceMessage(event) {
  if (!isHumanMessage(event) || !Array.isArray(event.data.content)) return null;
  return {
    seq: event.seq, time: event.time,
    text: event.data.content.filter(part => part?.type === 'text' && typeof part.text === 'string').map(part => part.text).join('\n'),
    attachments: event.data.content.filter(part => ['image', 'file'].includes(part?.type)).map(part => ({ kind: part.type, name: part.attachment?.name ?? '', attachmentId: part.attachment?.attachmentId ?? '', invalid: !validAttachment(part.type, part.attachment) })),
  };
}
