import { SlashCommandBuilder } from '@discordjs/builders';
import * as Discord from 'discord.js';
import autoComplete from '../utils/AutoComplete';

export default (client: Discord.Client): void => {
    client.on('interactionCreate', async (itr: Discord.Interaction) => {
        if (itr.isAutocomplete()) {
            await autoComplete(itr, client);
        }
    });
}