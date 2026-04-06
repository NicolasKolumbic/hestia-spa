import { Client } from "./client.dto";

export interface LoggedResponseDto {
    access_token?: string;
    requires2fa: boolean;
    temp_token?: string;
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    picture?: string;
    googleId?: string;
    accessToken?: string;
    clients: Client[];
}