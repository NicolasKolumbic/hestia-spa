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

    constructor({ channels, deviceId, name, status, manufacturer, model, serialNumber }: DeviceDto) {
        this.deviceId = deviceId;
        this.name = name;
        this.status = status;
        this.channels = channels.map(channel => new DeviceChannel(channel));
        this.manufacturer = manufacturer;
        this.model = model;
        this.serialNumber = serialNumber;
    }
}