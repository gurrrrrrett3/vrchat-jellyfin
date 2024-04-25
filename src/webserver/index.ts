import express from "express";
import http from "http";
import proxy from "http-proxy";
import ProxyManager from "../jellyfin/proxy/proxyManager";
import fetch from "node-fetch";
import ffmpegPath from "ffmpeg-static";
import { spawn } from "child_process";
import Scanner from "../transcode/scan";
import { Readable } from "stream";
import cloneable from "cloneable-readable";
import fs from "fs";

const app = express();
const proxyServer = proxy.createProxyServer({
    secure: false,
});

app.get("/i/:id", async (req, res) => {
    try {
        // get video info

        const proxy = ProxyManager.getProxy(req.params.id);

        if (!proxy) {
            res.status(404).send("Not found");
            return;
        }

        const stream = await fetch(proxy.downloadLink).then((response) => {
            return response.body;
        });

        const data = await Scanner.scanAllAndProcess(stream)

        res.send(data);

    } catch (err) {
        console.error(err);
        res.status(500).send("Internal server error");
    }
})

app.get("/v/:id", async (req, res) => {

    const link = ProxyManager.getProxy(req.params.id)?.downloadLink;

    if (!link) {
        res.status(404).send("Not found");
        return;
    }

    console.log(`Proxying ${link}`);

    // create read stream from link
    const stream = await fetch(link).then((response) => {
        return response.body;
    });

    const videoFilters = [
        'fps=fps=30',
        'scale=\'min(1280,iw)\':-2',
        // 'subtitles=\'pipe:0\'',
    ]

    const args = [
        '-i', 'pipe:0', // input from stdin
        '-vf'00, `"${videoFilters.join(', ')}"`, // video filters
        '-c:v', 'h264', // h264 codec
        '-preset', 'veryfast', // veryfast preset
        '-c:a', 'aac', // aac codec
        '-movflags', 'frag_keyframe+empty_moov+default_base_moof+faststart', // faststart
        '-f', 'mp4', // mp4 container
        '-'  // output to stdout
    ]

    const ffmpegCommand = `${ffmpegPath} ${args.join(' ')}`;
    console.log(`Running ffmpeg ${ffmpegCommand}`);

    const ffmpeg = spawn(ffmpegCommand, {
        shell: true,
    });

    ffmpeg.on('exit', (code) => {
        console.log(`FFMPEG exited with code ${code}`);
    });

    stream.pipe(ffmpeg.stdin);
    ffmpeg.stdout.pipe(res);
    ffmpeg.stderr.pipe(process.stdout);

    res.on('pipe', (src) => {
        src.on('data', (chunk) => {
            console.log(`Got ${chunk.length} bytes of data`);
        })
    })

    res.on('finish', () => {
        console.log(`Finished piping to client`);
    })

});

const server = http.createServer(app);

server.listen(3060, () => {
    console.log("Webserver listening on port 3060");
});

