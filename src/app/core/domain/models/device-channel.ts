import { DeviceChannelDto } from "../dtos/device-channel.dto";

export class DeviceChannel {
    channelId: string;
    deviceId: string;
    channelIndex: number;
    name: string;
    type: 'SWITCH' | 'DIMMER' | 'SENSOR';
    isPrimary: boolean;
    isOn: boolean;
    brightness: number;
    color: string;

    constructor({ brightness, channelId, channelIndex, color, deviceId, isOn, isPrimary, name, type }: DeviceChannelDto) {
        this.brightness = brightness;
        this.channelId = channelId;
        this.channelIndex = channelIndex;
        this.color = color;
        this.deviceId = deviceId;
        this.isOn = isOn;
        this.isPrimary = isPrimary;
        this.name = name;
        this.type = type;
    }
}