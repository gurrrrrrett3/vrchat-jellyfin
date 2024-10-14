// src/jellyfin/proxy/proxy.ts

export default class Proxy {
    public readonly id: string = Math.random().toString(36).substring(2, 15);
    public readonly createdAt: Date = new Date();

    constructor(public itemId: string, public options?: ProxyOptions) { } // Modified to accept options
}

export interface ProxyOptions {
    audioBitrate?: number;
    videoBitrate?: number;
    height?: number;
    width?: number;
    audioChannels?: number;
    videoStreamIndex?: number;
    audioStreamIndex?: number;
    subtitleStreamIndex?: number;
    subtitleMethod?: SubtitleMethod;
}

export enum SubtitleMethod {
    Encode = "Encode",
    Embed = "Embed",
    External = "External",
    Hls = "Hls",
    Drop = "Drop",
}
