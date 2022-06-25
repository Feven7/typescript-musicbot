import { Client } from "discord.js";
import Queue from '../utils/queue/Queue';

export default (client: Client): void => {
    client.on("ready", async () => {
        if (!client.user || !client.application) {
            return;
        }

        const queue: Queue[] = [];
        Object.defineProperty(client, "queue", queue);

        console.log(`${client.user.username} is online`);
    });
}; 