import { Api, Jellyfin, } from "@jellyfin/sdk";
import { getUserViewsApi } from "@jellyfin/sdk/lib/utils/api/user-views-api"
import { getItemsApi } from "@jellyfin/sdk/lib/utils/api/items-api"
import { getVideosApi } from "@jellyfin/sdk/lib/utils/api/videos-api"
import fetch from "node-fetch";

export default class JellyfinClient {

    public static readonly APP_NAME = "Jellyfin VRChat Proxy (jellyfin-vrchat)";

    private _sdk: Jellyfin;
    private _api: Api;

    public userId?: string;

    constructor(public serverUrl: string, private username: string, private password: string) {

        this._sdk = new Jellyfin({
            clientInfo: {
                name: JellyfinClient.APP_NAME,
                version: (process.env.npm_package_version || "0.0.0"),
            },
            deviceInfo: {
                name: `${JellyfinClient.APP_NAME} ${process.env.npm_package_version || "0.0.0"} | ${process.platform} | ${process.arch}`,
                id: "jellyfin-vrchat",
            }
        });

        this._api = this._sdk.createApi(serverUrl);

    }

    public get apiKey() {
        return this._api.accessToken
    }

    public async authenticate() {

        const auth = await this._api.authenticateUserByName(this.username, this.password).catch((e) => {
            console.error("Failed to authenticate with Jellyfin, check your username and password", e);
            process.exit(1);
        });

        this.userId = auth.data.User?.Id;
        return auth.status == 200

    }

    public async getPlayableMedia() {

        const viewsResponse = await getUserViewsApi(this._api).getUserViews({
            userId: this.userId!
        })

        const views = viewsResponse.data.Items || [];
        const items = await Promise.all(views.map(async (view) => {
            const itemsResponse = await this.getSubItemsRecursive(view.Id!);

            return {
                itemId: view.Id,
                name: view.Name,
                subItems: itemsResponse
            }

        }))
        return items
    }

    public async getSubItems(parent: string) {

        const itemsResponse = await getItemsApi(this._api).getItems({
            userId: this.userId!,
            parentId: parent,
        })

        return itemsResponse.data.Items
    }

    public async getSubItemsRecursive(parent: string): Promise<NestedItem[]> {
        const items = await this.getSubItems(parent);

        if (!items || items.length == 0) {
            return []
        }

        const subItems = await Promise.all(items.map(async (item) => {
            if (!item.IsFolder) {
                return {
                    itemId: item.Id!,
                    name: item.Name || undefined,
                    playable: item.MediaType == "Video",
                    episode: item.IndexNumber || undefined,
                }
            }

            return {
                itemId: item.Id!,
                name: item.Name || undefined,
                subItems: await this.getSubItemsRecursive(item.Id!)
            }
        }
        ))

        return subItems

    }

    public async getVideoStream(itemId: string) {
        const url = new URL(`${this.serverUrl}/Videos/${itemId}/stream.mp4`);
        url.searchParams.set("api_key", this.apiKey);
        url.searchParams.set("audioCodec", "aac");
        url.searchParams.set("videoCodec", "h264");
        // url.searchParams.set("audioBitrate", "128000");
        // url.searchParams.set("videoBitrate", "1000000");
        url.searchParams.set("maxAudioChannels", "2");
        url.searchParams.set("subtitleStreamIndex", "0")
        url.searchParams.set("audioStreamIndex", "0")
        url.searchParams.set("subtitleMethod", "Embed")

        console.log(`Requesting video stream from ${url.toString()}`);


        const response = await fetch(url.toString(), {
            headers: {
                "User-Agent": JellyfinClient.APP_NAME
            }
        })


        return response.body
    }

    public getRandomItem(items: NestedItem[]): NestedItem | undefined {
        if (items.length == 0) {
            return undefined
        }

        const item = items[Math.floor(Math.random() * items.length)];
        if (item.subItems && item.subItems.length > 0) {
            return this.getRandomItem(item.subItems)
        }

        return item
    }

}

interface NestedItem {
    itemId: string;
    name?: string;
    subItems?: NestedItem[];
}