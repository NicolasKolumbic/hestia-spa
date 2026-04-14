import { ClientLocationManagmentDto } from "../dtos/client-location-managment.dto";
import { SiteType } from "../../enums/site-type.enum";
import { SiteStatus } from "../../enums/site-status.enum";

export class Site {
    siteId: string;
    name: string;
    type: SiteType;
    status: SiteStatus;
    address: string;
    city: string;
    countryCode: string;
    locale: string;
    province: string;
    latitude: number;
    longitude: number;
    postalCode: string;
    userCount!: number;
    deviceCount!: number;
    temperature!: number;

    constructor({ site, userCount, deviceCount, temperature }: ClientLocationManagmentDto) {
        this.siteId = site.siteId;
        this.name = site.name;
        this.type = site.type;
        this.status = site.status;
        this.address = site.addressLine;
        this.city = site.city;
        this.countryCode = site.countryCode;
        this.locale = site.locale;
        this.province = site.province;
        this.latitude = site.latitude;
        this.longitude = site.longitude;
        this.postalCode = site.postalCode;
        this.userCount = userCount;
        this.deviceCount = deviceCount;
        this.temperature = temperature;
    }
}