import { SiteStatus } from "../../enums/site-status.enum";
import { SiteType } from "../../enums/site-type.enum";

export interface ClientLocationDto {
    siteId: string;
    name: string;
    type: SiteType;
    status: SiteStatus;
    addressLine: string;
    city: string;
    countryCode: string;
    locale: string;
    province: string;
    latitude: number;
    longitude: number;
    postalCode: string;
}