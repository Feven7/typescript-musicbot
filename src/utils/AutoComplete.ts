import { ApplicationCommandOptionChoice, Client, CommandInteraction, Interaction } from "discord.js";
import fetch from 'node-fetch';

async function autoCp(query: string) {
    return new Promise<string>((resolve, reject) => {
        let encodedQuery = encodeURIComponent(query);
        let url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodedQuery}`;
        fetch(url, { method: 'GET' }).then((res) => {
            res.json().then((json) => {
                resolve(json[1]);
            });
        }).catch(error => {
            reject(error);
        });
    });
}

export default async (itr: Interaction, client: Client) => {
    if (itr.isAutocomplete()) {
        let query = itr.options.getFocused(true);
        if (query.name === "query") {
            let value = query.value.toString();
            if (value.trim().length > 0) {
                let choices = await autoCp(value).catch(console.error);
                let ret: ApplicationCommandOptionChoice[] = [];
                if (Array.isArray(choices)) {
                    choices.forEach(choice => {
                        ret.push({ name: choice, value: choice });
                    });
                }
                await itr.respond(ret).catch(console.error);
            }
        }
    }
}