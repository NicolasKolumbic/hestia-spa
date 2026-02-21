import { DeviceChannelDto } from "./device-channel.dto";

export interface DeviceDto {
    deviceId: string;
    name: string;
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
    status: 'ONLINE' | 'OFFLINE' | 'UNKNOWN';
    channels: DeviceChannelDto[];
}