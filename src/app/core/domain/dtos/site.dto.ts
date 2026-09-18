import { SiteStatus } from "@core/enums/site-status.enum";
import { SiteType } from "@core/enums/site-type.enum";

export interface SiteDto {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    createdById: null;
    updatedById: null;
    clientId: string;
    name: string;
    type: SiteType;
    status: SiteStatus;
    addressLine: string;
    city: string;
    province: string;
    postalCode: string;
    countryCode: string;
    latitude: number;
    longitude: number;
    timezone: string;
    locale: string;
}
