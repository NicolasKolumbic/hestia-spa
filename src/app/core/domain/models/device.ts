import { DeviceDto } from "../dtos/device.dto";
import { DeviceChannel } from "./device-channel";

export class Device {
    deviceId: string;
    name: string;
    status: 'ONLINE' | 'OFFLINE' | 'UNKNOWN';
    channels: DeviceChannel[];
    manufacturer?: string;
    model?: string;
    serialNumber?: string;

    get id(): string {
        return this.deviceId;
    }

    constructor({ channels, id, name, status, manufacturer, model, serialNumber }: DeviceDto) {
        this.deviceId = id;
        this.name = name;
        this.status = status;
        this.channels = channels ? channels.map(channel => new DeviceChannel(channel)) : [];
        this.manufacturer = manufacturer;
        this.model = model;
        this.serialNumber = serialNumber;
    }
}