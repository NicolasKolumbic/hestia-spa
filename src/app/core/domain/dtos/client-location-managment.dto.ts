import { ClientLocationDto } from "./client-location.dto";

export interface ClientLocationManagmentDto {
    site: ClientLocationDto;
    userCount: number;
    deviceCount: number;
    temperature: number;
}