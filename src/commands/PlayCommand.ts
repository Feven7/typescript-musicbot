import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, TextChannel, VoiceChannel } from "discord.js";
import '@discordjs/voice'
import Voice from '@discordjs/voice'
import SongInfo from "../utils/queue/SongInfo";
import Queue, { queue } from "../utils/queue/Queue";
import play from 'play-dl';
import ytsr from 'youtube-sr';
import { Platform } from "../utils/queue/PlatformType";

export async function run(itr: CommandInteraction) {
    await itr.deferReply();

    if (itr.inGuild() && itr.client.isReady()) {
        const voiceChannel = itr.guild?.voiceStates.cache.get(
            itr.user.id
        )?.channel;
        if (!voiceChannel) return itr.editReply(":no_entry_sign: You must be in a voice channel to use this command.");

        const botVC = itr.guild.me?.voice.channel;
        if (botVC && botVC !== voiceChannel) return itr.editReply(":no_entry_sign: I am already in a voice channel.");

        // Check Bot has permission to join the channel
        if (voiceChannel.joinable && voiceChannel.permissionsFor(itr.client.user)) {
            if (!botVC && itr.guild && itr.channel) {
                // Connections
                const connection = Voice.joinVoiceChannel({
                    channelId: voiceChannel.id,
                    selfDeaf: true,
                    adapterCreator: itr.guild.voiceAdapterCreator,
                    guildId: itr.guild.id
                });

                // Create queue if not exists
                if (!queue.get(itr.guild.id)) {
                    queue.set(itr.guild.id, {
                        Songs: [],
                        Connection: connection,
                        TextChannel: itr.channel as TextChannel,
                        VoiceChannel: voiceChannel as VoiceChannel,
                        Loop: 'off'
                    });
                }

                setTimeout((() => {
                    if (itr.guild) {
                        const guild_queue = queue.get(itr.guild.id);

                        if (!guild_queue || !guild_queue.Songs || guild_queue.Songs.length <= 0) {
                            if (guild_queue) queue.delete(itr.guild.id);
                            itr.editReply(":no_entry_sign: Theres no activity, So I left voice channel!");
                            return;
                        }
                    }
                }), 1000 * 60);

                const soundcloudRegex = /^https?:\/\/(soundcloud\.com|snd\.sc)\/(.*)$/;
                const spotifyRegex = /^(https:\/\/open.spotify.com\/user\/spotify\/playlist\/|spotify:user:spotify:playlist:)([a-zA-Z0-9]+)(.*)$/gm;
                const youtubeVideoRegex = ytsr.Regex.VIDEO_URL;
                const youtubePlaylistRegex = ytsr.Regex.PLAYLIST_URL;

                const query = itr.options.getString("query");

                if (!query) return itr.editReply(":no_entry_sign: Query is invalid!");

                if (soundcloudRegex.test(query)) {
                    let validateSC = play.so_validate(query);

                    if (!validateSC) return itr.editReply(":no_entry_sign: We could not found Song or anything else!");

                    let info = await play.soundcloud(query);

                    if (info.type == "track") {
                        let newSong: SongInfo = {
                            title: info.name,
                            url: info.url,
                            duration: info.durationInMs,
                            platform: Platform.SOUNDCLOUD,
                            requester: itr.user
                        }

                        let stream = await play.stream(query);


                    } else if (info.type == "playlist") {
                        return itr.editReply(":no_entry_sign: Sorry, We're not supporting Soundcloud Playlist yet!");
                    } else {
                        return itr.editReply(":no_entry_sign: The song or else couldn't be played!");
                    }
                } else if (youtubeVideoRegex.test(query)) {
                    let validateYT = play.yt_validate(query);

                    if (!validateYT) return itr.editReply(":no_entry_sign: We could not found Song or anything else!");

                    let info = (await play.video_info(query)).video_details;

                    if (!info.title || !info.channel) return itr.editReply(":no_entry_sign: The song or else couldn't be played!");

                    let newSong: SongInfo = {
                        title: info.title,
                        url: info.url,
                        thumbnail: info.thumbnails[0].url,
                        duration: info.durationInSec * 1000,
                        requester: itr.user,
                        uploader: info.channel.name,
                        uploaderURL: info.channel.url,
                        platform: Platform.YOUTUBE
                    }

                    let stream = await play.stream(query);

                } else if (youtubePlaylistRegex.test(query)) {
                    let validateYTPL = play.yt_validate(query);

                    if (!validateYTPL) return itr.editReply(":no_entry_sign: We could not found Song or anything else!");

                    let info = await ytsr.getPlaylist(query);

                    let queue_ = queue.get(itr.guild.id);

                    if (!queue_) return itr.editReply(":no_entry_sign: An Error Occurred!");

                    for (let video of info.videos) {
                        if (!video.title || !video.channel) {
                            return itr.editReply(":no_entry_sign: The song or else couldn't be played!");
                        }

                        let newSong: SongInfo = {
                            title: video.title,
                            url: video.url,
                            thumbnail: video.thumbnail?.url,
                            duration: video.duration,
                            requester: itr.user,
                            uploader: video.channel.name,
                            uploaderURL: video.channel.url,
                            platform: Platform.YOUTUBE
                        }

                        queue_.Songs?.push(newSong);
                    }
                } else {
                    // TODO : Show search results selection
                }
            }
        }
    }
}

export const data: SlashCommandBuilder = new SlashCommandBuilder()
    .setName('play')
    .addStringOption(option =>
        option.setName('query')
            .setRequired(true)
            .setDescription('The song to play')
            .setAutocomplete(true)
    ).setDescription('Plays a song');