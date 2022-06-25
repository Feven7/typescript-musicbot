import { User } from "discord.js";
import { Platform } from "./PlatformType";

export default interface SongInfo {
    title: string; // The title of the song
    url: string; // Video URL
    thumbnail?: string; // Thumbnail's URL
    duration?: number; // Duration of the song in seconds
    requester: User; // The user who requested the song
    uploader?: string; // The uploader's Name of the song
    uploaderURL?: string; // The uploader's URL of the song
    platform: Platform; // Platform of the song
}