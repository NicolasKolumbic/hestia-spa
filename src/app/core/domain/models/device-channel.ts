import { DeviceChannelDto, DeviceChannelPayload } from "../dtos/device-channel.dto";
import { DeviceChannelType } from "./device-channel-type";

export class DeviceChannel {
    channelId: string;
    deviceId: string;
    channelIndex: number;
    name: string;
    type: DeviceChannelType;
    isPrimary: boolean;
    isOn: boolean;
    /** Generic state payload containing state, pendingState, lastUncertainCommand, etc. */
    payload: DeviceChannelPayload;

    // Legacy accessors for backwards compatibility
    get brightness(): number { return this.payload['brightness'] ?? 100; }
    get color(): string { return this.payload['color'] ?? '#ffffff'; }

    /** Indicates whether an operation is currently in-flight awaiting physical confirmation from Cloud/Gateway */
    get isPending(): boolean {
        return !!this.payload?.pendingState && this.payload.pendingState.status === 'IN_FLIGHT';
    }

    /** The desired state requested by the user while operation is pending */
    get pendingIsOn(): boolean | undefined {
        return this.payload?.pendingState?.requestedState?.isOn;
    }

    /** The pending command ID */
    get pendingCommandId(): string | undefined {
        return this.payload?.pendingState?.commandId;
    }

    /** Indicates whether the last operation finished with an uncertain timeout */
    get isUncertain(): boolean {
        return !!this.payload?.lastUncertainCommand;
    }

    /** Descriptive reason if the state is uncertain */
    get uncertainReason(): string | undefined {
        return this.payload?.lastUncertainCommand?.reason;
    }

    /** Error message if the last operation failed explicitly on hardware */
    get lastError(): string | undefined {
        return this.payload?.lastFailedCommand?.error?.message;
    }

    constructor(data: DeviceChannelDto) {
        this.channelId = data.channelId || (data as any).id;
        this.channelIndex = data.channelIndex;
        this.deviceId = data.deviceId;
        this.isOn = data.isOn;
        this.isPrimary = data.isPrimary;
        this.name = data.name;
        this.type = data.type as DeviceChannelType;
        // Build payload from legacy fields or use the new payload field
        this.payload = data.payload ?? {
            ...(data.brightness !== undefined && { brightness: data.brightness }),
            ...(data.color !== undefined && { color: data.color }),
        };
    }
}
