export class Site {
    siteId!: string;
    name!: string;
    icon!: string;
    address!: string;

    constructor(siteId: string, name: string, icon: string, address: string) {
        this.siteId = siteId;
        this.name = name;
        this.icon = icon;
        this.address = address;
    }
}