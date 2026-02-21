export class DeviceType {
    deviceTypeId: string;
    code: string;
    name: string;
    defaultChannelCount: number;
    capabilities?: any;

    constructor(deviceTypeId: string, code: string, name: string, defaultChannelCount: number, capabilities?: any) {
        this.deviceTypeId = deviceTypeId;
        this.code = code;
        this.name = name;
        this.defaultChannelCount = defaultChannelCount;
        this.capabilities = capabilities;
    }
}
