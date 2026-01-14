export class Site {
    siteId!: string;
    name!: string;

    constructor(siteId: string, name: string) {
        this.siteId = siteId;
        this.name = name;
    }
}