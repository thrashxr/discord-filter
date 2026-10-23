/**
 * Compiled in CI against real Discord.js, grammY and Telegraf type declarations.
 * It is intentionally not executed and does not make network connections.
 */
import { Client, GatewayIntentBits } from 'discord.js';
import { Bot } from 'grammy';
import { Telegraf } from 'telegraf';
import { Filter } from 'modsent';
import { createDiscordModerator } from 'modsent/discordjs';
import { createGrammyMiddleware } from 'modsent/grammy';
import { createTelegrafMiddleware } from 'modsent/telegraf';

const filter = new Filter({ languages: ['en'], words: ['exampleblockword'] });
const client = new Client({ intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent,
] });
client.on('messageCreate', createDiscordModerator({
  filter,
  skip: (message) => message.author.bot,
  onMatch: (message, result) => {
    if (result.match) void message.content;
  },
}));

const grammy = new Bot('000:fake');
grammy.use(createGrammyMiddleware({
  filter, skip: (ctx) => ctx.from?.is_bot ?? false,
}));

const telegraf = new Telegraf('000:fake');
telegraf.use(createTelegrafMiddleware({
  filter, skip: (ctx) => ctx.from?.is_bot ?? false,
}));
