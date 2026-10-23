import { moderate, telegramContent, type ModeratorOptions } from './shared';
export interface GrammyContext {
  message?: unknown;
  from?: { is_bot?: boolean };
  deleteMessage(): Promise<unknown>;
}
export type GrammyModeratorOptions = ModeratorOptions<GrammyContext>;
export function createGrammyMiddleware(options: GrammyModeratorOptions) {
  return async (ctx: GrammyContext, next: () => Promise<unknown>): Promise<unknown> => {
    if (ctx.from?.is_bot) return next();
    const stop = await moderate(ctx, telegramContent(ctx.message), options, () => ctx.deleteMessage());
    if (!stop) return next();
  };
}
