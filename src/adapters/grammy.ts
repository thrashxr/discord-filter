import { moderate, type ModeratorOptions } from './shared';
export interface GrammyContext {
  message?: { text?: string; caption?: string };
  from?: { is_bot?: boolean };
  deleteMessage(): Promise<unknown>;
}
export type GrammyModeratorOptions = ModeratorOptions<GrammyContext>;
export function createGrammyMiddleware(options: GrammyModeratorOptions) {
  return async (ctx: GrammyContext, next: () => Promise<unknown>): Promise<unknown> => {
    if (ctx.from?.is_bot) return next();
    const stop = await moderate(ctx, ctx.message?.text ?? ctx.message?.caption, options, () => ctx.deleteMessage());
    if (!stop) return next();
  };
}
