export interface DeviceChannelDto {
    channelId: string;
    deviceId: string;
    channelIndex: number;
    name: string;
    type: string;
    isPrimary: boolean;
    isOn: boolean;
    payload?: Record<string, any>;
    // Legacy fields - kept for backwards compatibility
    brightness: number;
    color: string;
}