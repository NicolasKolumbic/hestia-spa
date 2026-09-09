import { SiteStatus } from "@core/enums/site-status.enum";
import { SiteType } from "@core/enums/site-type.enum";

export interface SiteDto {
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
}