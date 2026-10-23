import { moderate, type ModeratorOptions } from './shared';
export interface TelegrafContext {
  message?: { text?: string };
  from?: { is_bot?: boolean };
  deleteMessage(): Promise<unknown>;
}
export type TelegrafModeratorOptions = ModeratorOptions<TelegrafContext>;
export function createTelegrafMiddleware(options: TelegrafModeratorOptions) {
  return async (ctx: TelegrafContext, next: () => Promise<unknown>): Promise<unknown> => {
    if (ctx.from?.is_bot) return next();
    const stop = await moderate(ctx, ctx.message?.text, options, () => ctx.deleteMessage());
    if (!stop) return next();
  };
}
