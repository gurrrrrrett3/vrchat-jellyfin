export default class Proxy {

    public readonly id: string = Math.random().toString(36).substring(2, 15)
    public readonly createdAt: Date = new Date();

    constructor(public downloadLink: string) {}
}