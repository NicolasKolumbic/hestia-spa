import { ClientDto } from "./client.dto";

export interface ClientManagmentDto {
    client: ClientDto;
    userCount: number;
    deviceCount: number;
}