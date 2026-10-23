import type { Filter } from '../Filter';
import type { FilterMatch, MatchType } from '../types';

export interface ModeratorOptions<TContext> {
  filter: Filter;
  action?: 'delete' | 'none';
  /** Restrict which match categories trigger moderation; all by default. */
  categories?: readonly MatchType[];
  skip?: (ctx: TContext) => boolean | Promise<boolean>;
  onMatch?: (ctx: TContext, result: FilterMatch) => void | Promise<void>;
  onError?: (error: unknown, ctx: TContext) => void | Promise<void>;
  stopOnMatch?: boolean;
}

/** Returns true when the middleware should stop. */
export async function moderate<TContext>(
  ctx: TContext,
  content: string | undefined,
  options: ModeratorOptions<TContext>,
  remove: () => Promise<unknown>,
): Promise<boolean> {
  if (!content) return false;
  try {
    if (await options.skip?.(ctx)) return false;
    const match = options.categories
      ? options.filter.checkAll(content).matches.find((m) => options.categories!.includes(m.type))
      : options.filter.check(content);
    if (!match || !match.match) return false;
    if ((options.action ?? 'delete') === 'delete') await remove();
    await options.onMatch?.(ctx, match);
    return options.stopOnMatch !== false;
  } catch (error) {
    if (!options.onError) throw error;
    await options.onError(error, ctx);
    return false;
  }
}

/** Read Telegram text or media captions from structurally typed messages. */
export function telegramContent(message: unknown): string | undefined {
  if (!message || typeof message !== 'object') return undefined;
  if ('text' in message && typeof message.text === 'string') return message.text;
  if ('caption' in message && typeof message.caption === 'string') return message.caption;
  return undefined;
}
