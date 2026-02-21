export interface DeviceChannelDto {
    channelId: string;
    deviceId: string;
    channelIndex: number;
    name: string;
    type: 'SWITCH' | 'DIMMER' | 'SENSOR';
    isPrimary: boolean;
    isOn: boolean;
    brightness: number;
    color: string;
}