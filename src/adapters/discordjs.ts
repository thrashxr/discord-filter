import { moderate, type ModeratorOptions } from './shared';
/** Structural Discord.js Message shape, no Discord.js runtime dependency. */
export interface DiscordMessage {
  content: string;
  author: { bot: boolean };
  guild: unknown | null;
  delete(): Promise<unknown>;
}
export interface DiscordModeratorOptions extends ModeratorOptions<DiscordMessage> {
  includeDMs?: boolean;
}
/** Register with client.on('messageCreate', createDiscordModerator({ filter })). */
export function createDiscordModerator(options: DiscordModeratorOptions) {
  return async (message: DiscordMessage): Promise<void> => {
    if (message.author.bot || (!options.includeDMs && !message.guild)) return;
    await moderate(message, message.content, options, () => message.delete());
  };
}
