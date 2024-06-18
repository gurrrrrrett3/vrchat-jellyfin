import express from "express";
import http from "http";
import ProxyManager from "../jellyfin/proxy/proxyManager";
import { client } from "../jellyfin";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/assets", express.static("dist/client"));

app.get("/", (req, res) => {
    res.sendFile("index.html", { root: "dist/client" });
})

app.get("/i", async (req, res) => {
    const items = await client.getPlayableMedia();
    res.json(items);
})

app.get("/i/:id", async (req, res) => {
    const proxy = ProxyManager.createProxy(req.params.id)
    res.json({
        id: proxy.id,
    });
})

app.get("/v/:id", async (req, res) => {

    const itemId = ProxyManager.getProxy(req.params.id)?.itemId;

    const stream = await client.getVideoStream(itemId!);
    stream.pipe(res);

    console.log(`Piping stream to client`);
});

const server = http.createServer(app);
const port = parseInt(process.env.PORT as string) || 3060;

server.listen(port, () => {
    console.log(`Webserver listening on port ${port}`);
});

