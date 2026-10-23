import { moderate, telegramContent, type ModeratorOptions } from './shared';
export interface TelegrafContext {
  message?: unknown;
  from?: { is_bot?: boolean };
  deleteMessage(): Promise<unknown>;
}
export type TelegrafModeratorOptions = ModeratorOptions<TelegrafContext>;
export function createTelegrafMiddleware(options: TelegrafModeratorOptions) {
  return async (ctx: TelegrafContext, next: () => Promise<unknown>): Promise<unknown> => {
    if (ctx.from?.is_bot) return next();
    const stop = await moderate(ctx, telegramContent(ctx.message), options, () => ctx.deleteMessage());
    if (!stop) return next();
  };
}
