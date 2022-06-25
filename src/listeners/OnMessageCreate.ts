import * as Discord from "discord.js";
import Dokdo from 'dokdo';
import { readFileSync } from "fs";

const prefix = JSON.parse(readFileSync(`${process.env.PWD}/src/config.json`).toString()).prefix;

export default (client: Discord.Client): void => {

    const DokdoHandler = new Dokdo(client, { aliases: ['dokdo', 'dok'], prefix: prefix, globalVariable: [], owners: ['677753583491481610'], secrets: [], noPerm: (message) => message.reply('🚫 You don\'t have a permission to perfom this command.') });

    client.on("messageCreate", async (message) => {
        await DokdoHandler.run(message);
    });
}