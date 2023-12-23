import { Api, Jellyfin, } from "@jellyfin/sdk";
import { getUserViewsApi } from "@jellyfin/sdk/lib/utils/api/user-views-api"
import { getItemsApi } from "@jellyfin/sdk/lib/utils/api/items-api"
import { BaseItemDto } from "@jellyfin/sdk/lib/generated-client/models";

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
                id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            }
        });

        this._api = this._sdk.createApi(serverUrl);

    }

    public async authenticate() {

        const auth = await this._api.authenticateUserByName(this.username, this.password);
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
                viewId: view.Id,
                viewName: view.Name,
                items: itemsResponse
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

    public getDownloadLink(itemId: string) {
        return this._api.basePath + "/Items/" + itemId + "/Download?api_key=" + this._api.accessToken
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