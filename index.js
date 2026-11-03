import { z } from 'zod';
import { PROJECTION_KEY, STATE_VERSION, initSources, applySources, sourcesView } from './src/indexer.js';
import { createSourcesService, registerSourcesRoutes } from './src/server.js';

export const inject = ['sessionProjections', 'sessions', 'sessionController', 'attachments', 'connection'];
const sourceSchema = z.object({ seq: z.number().int().nonnegative(), time: z.number(), messageId: z.string(), snippet: z.string() });
const itemSchema = z.object({
  id: z.string(), kind: z.enum(['image', 'file', 'link']), name: z.string(), sources: z.array(sourceSchema),
  url: z.string().optional(), invalid: z.literal(true).optional(),
  attachment: z.object({
    attachmentId: z.string(), bytes: z.number(), name: z.string().optional(),
    mediaType: z.string().optional(), width: z.number().optional(), height: z.number().optional(),
    originalDimensions: z.object({ width: z.number(), height: z.number() }).optional(),
  }).optional(),
});
export const SourcesStateSchema = z.object({ items: z.record(z.string(), itemSchema), order: z.array(z.string()), warnings: z.number().int().nonnegative() });
export function apply(ctx) {
  ctx.sessionProjections.register({
    key: PROJECTION_KEY, stateVersion: STATE_VERSION, stateSchema: SourcesStateSchema,
    init: initSources, apply: applySources,
    wire: { viewSchema: SourcesStateSchema, view: sourcesView },
  });
  const service = createSourcesService(ctx);
  ctx.effect(() => registerSourcesRoutes(ctx, service), 'session-sources: authenticated read-only routes');
}
