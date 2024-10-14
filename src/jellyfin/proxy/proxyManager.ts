// src/jellyfin/proxy/proxyManager.ts

import Proxy from "./proxy";
import { ProxyOptions } from "./proxy";

export default class ProxyManager {

    public static readonly PROXY_TIMEOUT = 1000 * 60 * 60 * 24; // 24 hours
    public static proxies: Map<string, Proxy> = new Map();

    public static init() {
        setInterval(ProxyManager.cleanProxies, 1000 * 60 * 60); // 1 hour
    }

    // Modified createProxy method to accept options
    public static createProxy(itemId: string, options?: ProxyOptions) {
        const proxy = new Proxy(itemId, options);
        ProxyManager.proxies.set(proxy.id, proxy);
        return proxy;
    }

    public static getProxy(id: string) {
        return ProxyManager.proxies.get(id);
    }

    public static deleteProxy(id: string) {
        return ProxyManager.proxies.delete(id);
    }

    public static getProxies() {
        return Array.from(ProxyManager.proxies.values());
    }

    public static cleanProxies() {
        const now = new Date();
        ProxyManager.proxies.forEach((proxy) => {
            if (now.getTime() - proxy.createdAt.getTime() > ProxyManager.PROXY_TIMEOUT) {
                ProxyManager.deleteProxy(proxy.id);
            }
        });
    }

}
