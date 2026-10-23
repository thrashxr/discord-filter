import { moderate, type ModeratorOptions } from './shared';
export interface GrammyContext {
  message?: { text?: string };
  from?: { is_bot?: boolean };
  deleteMessage(): Promise<unknown>;
}
export type GrammyModeratorOptions = ModeratorOptions<GrammyContext>;
export function createGrammyMiddleware(options: GrammyModeratorOptions) {
  return async (ctx: GrammyContext, next: () => Promise<unknown>): Promise<unknown> => {
    if (ctx.from?.is_bot) return next();
    const stop = await moderate(ctx, ctx.message?.text, options, () => ctx.deleteMessage());
    if (!stop) return next();
  };
}
