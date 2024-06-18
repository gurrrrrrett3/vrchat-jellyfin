import JellyfinClient from "./client";
import fs from "fs";
import ProxyManager from "./proxy/proxyManager";

export const client = new JellyfinClient(process.env.JELLYFIN_HOST!, process.env.JELLYFIN_USERNAME!, process.env.JELLYFIN_PASSWORD!);

client.authenticate().then(async (success) => {

    if (!success) {
        console.error("Failed to authenticate with Jellyfin server");
        process.exit(1);
    }

    const libraries = await client.getPlayableMedia();

    fs.writeFileSync("libraries.json", JSON.stringify(libraries, null, 2));


    const item = client.getRandomItem(libraries.map((library) => library.items).flat());
    const proxy = ProxyManager.createProxy('353a684e532da2cd57647f6ab3eb23a0')

    console.log(`Proxy created: http://10.1.1.10:3060/v/${proxy.id}`);



});
