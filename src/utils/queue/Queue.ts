import { Guild, TextChannel, VoiceChannel } from 'discord.js';
import { VoiceConnection } from '@discordjs/voice';
import SongInfo from './SongInfo';
import { LoopModes } from './LoopModes';

export default interface Queue {
    Connection: VoiceConnection;
    Songs?: SongInfo[];
    TextChannel: TextChannel;
    VoiceChannel: VoiceChannel;
    Loop: LoopModes;
}

export const queue = new Map<string, Queue>();