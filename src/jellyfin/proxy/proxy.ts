export default class Proxy<Options extends ProxyOptions = {

}> {

    public readonly id: string = Math.random().toString(36).substring(2, 15)
    public readonly createdAt: Date = new Date();

    constructor(public itemId: string) { }

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
    subtitleMethod?: SubtitleMethod
}

enum SubtitleMethod {
    Encode = "Encode",
    Embed = "Embed",
    External = "External",
    H1s = "H1s",
    Drop = "Drop"
}
