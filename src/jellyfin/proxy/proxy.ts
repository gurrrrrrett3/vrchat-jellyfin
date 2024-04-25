export default class Proxy {

    public readonly id: string = Math.random().toString(36).substring(2, 15)
    public readonly createdAt: Date = new Date();

    constructor(public host: string, public itemId: string, public apiKey: string) {}

    public get downloadLink() {
        return `${this.host}/Items/${this.itemId}/Download?api_key=${this.apiKey}`;
    }
}