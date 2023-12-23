import express from "express";
import http from "http";
import proxy from "http-proxy";
import ProxyManager from "../jellyfin/proxy/proxyManager";

const app = express();
const proxyServer = proxy.createProxyServer({
    secure: false,
});

app.get("/v/:id", (req, res) => {

    const link = ProxyManager.getProxy(req.params.id)?.downloadLink;

    if (!link) {
        res.status(404).send("Not found");
        return;
    }

    console.log(`Proxying ${link}`);

    proxyServer.web(req, res, {
        target: link,
        headers: {
            "X-Proxied-By": "Jellyfin VRChat Proxy (jellyfin-vrchat)",
        }
    });

});

const server = http.createServer(app);

server.listen(3000, () => {
    console.log("Webserver listening on port 3000");
});