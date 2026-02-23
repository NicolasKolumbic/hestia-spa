import { DeviceChannelDto } from "../dtos/device-channel.dto";
import { DeviceChannelType } from "./device-channel-type";

export class DeviceChannel {
    channelId: string;
    deviceId: string;
    channelIndex: number;
    name: string;
    type: DeviceChannelType;
    isPrimary: boolean;
    isOn: boolean;
    /** Generic state payload. Shape depends on channel type. */
    payload: Record<string, any>;

    // Legacy accessors for backwards compatibility
    get brightness(): number { return this.payload['brightness'] ?? 100; }
    get color(): string { return this.payload['color'] ?? '#ffffff'; }

    constructor({ brightness, channelId, channelIndex, color, deviceId, isOn, isPrimary, name, type, payload }: DeviceChannelDto) {
        this.channelId = channelId;
        this.channelIndex = channelIndex;
        this.deviceId = deviceId;
        this.isOn = isOn;
        this.isPrimary = isPrimary;
        this.name = name;
        this.type = type as DeviceChannelType;
        // Build payload from legacy fields or use the new payload field
        this.payload = payload ?? {
            ...(brightness !== undefined && { brightness }),
            ...(color !== undefined && { color }),
        };
    }
}