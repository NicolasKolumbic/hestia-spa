import { ClientLocationDto } from "../dtos/client-location.dto";
import { SiteDto } from "../dtos/site.dto";

export class Site {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    createdById: null;
    updatedById: null;
    clientId: string;
    name: string;
    type: string;
    status: string;
    addressLine: string;
    city: string;
    province: string;
    postalCode: string;
    countryCode: string;
    latitude: number;
    longitude: number;
    timezone: string;
    locale: string;

    constructor(site: SiteDto) {
        this.id = site.id;
        this.createdAt = site.createdAt;
        this.updatedAt = site.updatedAt;
        this.createdById = site.createdById;
        this.updatedById = site.updatedById;
        this.clientId = site.clientId;
        this.name = site.name;
        this.type = site.type;
        this.status = site.status;
        this.addressLine = site.addressLine;
        this.city = site.city;
        this.province = site.province;
        this.postalCode = site.postalCode;
        this.countryCode = site.countryCode;
        this.latitude = site.latitude;
        this.longitude = site.longitude;
        this.timezone = site.timezone;
        this.locale = site.locale;
    }
}