import { spawn } from "child_process";
import cloneable from "cloneable-readable";
import { Readable } from "stream";
import { path as ffprobePath } from "ffprobe-static";
import Utils from "../utils";


export default class Scanner {

    public static async scanAudioTracks(stream: NodeJS.ReadableStream): Promise<FfprobeAudioResponse> {

        const args = [
            '-show_entries', 'stream',
            '-select_streams', 'a',
            '-of', 'json',
            'pipe:0'
        ]

        return await Scanner.scan(stream, args);
    }

    public static async scanSubtitleTracks(stream: NodeJS.ReadableStream): Promise<FfprobeSubtitleResponse> {
        const args = [
            '-show_entries', 'stream=index:stream_tags',
            '-select_streams', 's',
            '-of', 'json',
            'pipe:0'
        ]

        return await Scanner.scan(stream, args);
    }

    public static async scanVideoTracks(stream: NodeJS.ReadableStream): Promise<FfprobeVideoResponse> {
        const args = [
            '-show_entries', 'stream',
            '-select_streams', 'v',
            '-of', 'json',
            'pipe:0'
        ]

        return await Scanner.scan(stream, args);
    }

    public static async scanAll(incomingStream: NodeJS.ReadableStream): Promise<FfprobeScanAllResponse> {

        const stream = cloneable(new Readable().wrap(incomingStream));

        stream.resume();

        const results = await Promise.all([
            Scanner.scanAudioTracks(stream.clone()),
            Scanner.scanSubtitleTracks(stream.clone()),
            Scanner.scanVideoTracks(stream.clone()),
        ]);

        stream.on('error', (err) => {
            console.error(err);
            throw err;
        })

        stream.pause();

        return {
            audio: results[0].streams,
            subtitles: results[1].streams,
            video: results[2].streams
        }
    }

    public static processScanData(data: FfprobeScanAllResponse) {

        const audioTracks: Record<number, string> = {};
        data.audio.forEach((track) => {
            audioTracks[track.index] = `${track.tags.language} | ${track.codec_long_name} | ${Utils.kFormat(parseInt(track.bit_rate))}`
        })

        const subtitleTracks: Record<number, string> = {};
        data.subtitles.forEach((track) => {
            subtitleTracks[track.index] = `${track.tags.title || track.tags.language}`
        })

        const videoTracks: Record<number, string> = {};
        data.video.forEach((track) => {
            videoTracks[track.index] = `${track.tags.title || track.tags.filename} | ${track.codec_long_name} | ${track.width}x${track.height}`
        })

        return {
            audioTracks,
            subtitleTracks,
            videoTracks
        }
    }

    public static async scanAllAndProcess(stream: NodeJS.ReadableStream) {
        const data = await Scanner.scanAll(stream);
        return Scanner.processScanData(data);
    }

    private static async scan(stream: NodeJS.ReadableStream, args: string[]) {

        try {

            const ffmprobe = spawn(ffprobePath, args, {
                stdio: ['pipe', 'pipe', 'ignore']
            });

            console.log(`Running ffprobe ${args.join(' ')}`);

            stream.pipe(ffmprobe.stdin);
            const data = await new Promise((resolve, reject) => {
                let data = '';
                ffmprobe.stdout.on('data', (chunk) => {
                    data += chunk;
                })
                ffmprobe.stdout.on('end', () => {
                    resolve(data);
                })
            }).catch((err) => {
                console.error(err);
                ffmprobe.kill();
                throw err;
            })

            ffmprobe.stdin.on('error', (err) => {
                console.error(err);
                ffmprobe.kill();
                throw err;
            })

            stream.unpipe(ffmprobe.stdin);
            stream.pause();
            ffmprobe.kill();

            return JSON.parse(data as string)

        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}

interface FfprobeStreamResponse<T> {
    programs: any[];
    streams: (T & { index: number })[];
}

type FfprobeAudioResponse = FfprobeStreamResponse<{
    codec_name: string;
    codec_long_name: string;
    bit_rate: string;
    tags: {
        language: string
    }
}>

type FfprobeSubtitleResponse = FfprobeStreamResponse<{
    tags: {
        language: string
        title: string
    }
}>

type FfprobeVideoResponse = FfprobeStreamResponse<{
    codec_name: string;
    codec_long_name: string;
    codec_type: string;
    width: number;
    height: number;
    disposition: {
        default: number;
        attached_pic: number;
    };
    tags: {
        title: string;
        filename?: string;
        mimetype?: string;
    }
}>

interface FfprobeScanAllResponse {
    audio: FfprobeAudioResponse['streams']
    subtitles: FfprobeSubtitleResponse['streams']
    video: FfprobeVideoResponse['streams']
}

