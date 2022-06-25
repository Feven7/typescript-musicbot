import { REST } from '@discordjs/rest'
import { SlashCommandBuilder } from '@discordjs/builders';
import { Client, Collection, Message, CommandInteraction, Interaction, Guild } from "discord.js";
import { readdir } from "fs";
import 'dotenv';
import { Routes } from 'discord-api-types/v9';

export default (client: Client): void => {

    const commands: Collection<SlashCommandBuilder, (e: CommandInteraction) => any> = new Collection();
    const commandBuilders: SlashCommandBuilder[] = [];

    readdir(`${process.env.PWD}/src/commands/`, async (err, allFiles) => {
        if (err) console.log(err);
        let files = allFiles.filter(f => f.split('.').pop() === 'ts');
        if (files.length <= 0) console.log('No commands found!');
        else for (let file of files) {
            const props = require(`${process.env.PWD}/src/commands/${file}`) as { data: SlashCommandBuilder, run: (e: CommandInteraction) => any };
            commands.set(props.data, props.run);
            commandBuilders.push(props.data);
        }
    });

    client.on('ready', async () => {
        const rest = new REST({ version: '9' }).setToken(`${process.env.TOKEN}`);

        let cmds: any[] = [];
        commandBuilders.forEach(command => {
            cmds.push(command.toJSON());
        });

        try {
            const Guilds = client.guilds.cache.map(guild => guild.id);
            Guilds.forEach(async (guild) => {
                await rest.put(
                    Routes.applicationGuildCommands(`${client.user?.id}`, guild),
                    { body: cmds }
                );
            });
        } catch (err) {
            console.error(err);
            console.log("An error occurred while putting commands");
        }
    });

    client.on('interactionCreate', (_itr: Interaction) => {
        if (_itr.type !== 'APPLICATION_COMMAND') return;

        const itr = _itr as CommandInteraction;
        const command = itr.commandName;
        const commandFile = commands.find((r, n) => n.name === command);
        if (!commandFile) return;
        else commandFile(itr);
    });
}
