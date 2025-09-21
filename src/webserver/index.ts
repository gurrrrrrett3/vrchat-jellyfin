// src/webserver/index.ts

import express from "express";
import http from "http";
import ProxyManager from "../jellyfin/proxy/proxyManager";
import { client } from "../jellyfin";
import { ProxyOptions, SubtitleMethod } from "../jellyfin/proxy/proxy";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/assets", express.static("dist/client"));

// Serve the index.html file from the correct directory
app.get("/", (req, res) => {
    res.sendFile("index.html", { root: "dist/client" });
});

// Endpoint to fetch playable media
app.get("/i", async (req, res) => {
    const items = await client.getPlayableMedia();
    res.json(items);
});

// Endpoint to create a proxy with subtitle options
app.post("/i/:id", async (req, res) => {
    const itemId = req.params.id;
    const { subtitleStreamIndex } = req.body;

    const proxyOptions: ProxyOptions = {};

    if (subtitleStreamIndex != null) {
        proxyOptions.subtitleStreamIndex = subtitleStreamIndex;
        proxyOptions.subtitleMethod = SubtitleMethod.Encode;
    }

    const proxy = ProxyManager.createProxy(itemId, proxyOptions);
    res.json({
        id: proxy.id,
    });
});

// Endpoint to fetch subtitle streams
app.get("/subtitles/:itemId", async (req, res) => {
    const itemId = req.params.itemId;
    try {
        const subtitleStreams = await client.getSubtitleStreams(itemId);
        res.json({ subtitleStreams });
    } catch (error) {
        console.error('Error fetching subtitle streams:', error);
        res.status(500).json({ error: 'Failed to fetch subtitle streams.' });
    }
});

// Endpoint to stream video with subtitle options
app.get("/v/:id", async (req, res) => {
    const proxy = ProxyManager.getProxy(req.params.id);

    if (!proxy) {
        res.status(404).send("Proxy not found, is your url valid?");
        return;
    }

    const itemId = proxy.itemId;
    const options = proxy.options;

    try {
        const response = await client.getVideoStream(itemId!, options);
        if (!response.ok || !response.body) {
            const errorText = await response.text();
            console.error(`Jellyfin stream fetch failed:`, {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
                bodySnippet: errorText.slice(0, 200)
            });
            res.status(502).send("Failed to fetch video stream from Jellyfin.");
            return;
        }
        // Set headers from Jellyfin response
        for (const [key, value] of response.headers.entries()) {
            if (key.toLowerCase() === 'transfer-encoding') continue; // skip problematic headers
            res.setHeader(key, value);
        }
        response.body.pipe(res);
        console.log(`Piping stream to client with options:`, options);
    } catch (err) {
        console.error('Error in /v/:id route:', err);
        res.status(500).send('Internal server error while proxying video stream.');
    }
});

// Start the server after Jellyfin client authentication
client.authenticate().then((success) => {
    if (!success) {
        console.error("Failed to authenticate with Jellyfin server");
        process.exit(1);
    }

    const server = http.createServer(app);
    const port = parseInt(process.env.WEBSERVER_PORT || "4000");

    server.listen(port, () => {
        console.log(`Webserver listening on port ${port}`);
    });
});
