import * as Discord from 'discord.js';
import { Intents } from 'discord.js';
import 'dotenv/config'
import ready from './listeners/OnReady';
import handleMessage from './listeners/OnMessageCreate';
import handleSlashCommand from './utils/SlashCommandHandler';
import interactEvent from './listeners/OnInteraction';

const client = new Discord.Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_VOICE_STATES] });

ready(client);
handleMessage(client);
handleSlashCommand(client);
interactEvent(client);

client.login(process.env.TOKEN);