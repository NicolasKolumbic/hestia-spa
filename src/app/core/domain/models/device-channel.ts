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

    /** Access to the raw last failed command historical diagnostic entry */
    get lastFailedCommand() {
        return this.payload?.lastFailedCommand;
    }

    /**
     * Historical error message from the last recorded failure, provided it was not
     * superseded by a more recent successful confirmation.
     * Note: This represents historical diagnostic data, NOT active UI state.
     */
    get historicalError(): string | undefined {
        const failed = this.payload?.lastFailedCommand;
        if (!failed?.error?.message) return undefined;

        const confirmedAtStr = this.payload?.lastConfirmedAt;
        const failedAtStr = failed.failedAt;

        if (confirmedAtStr && failedAtStr) {
            const confirmedTime = new Date(confirmedAtStr).getTime();
            const failedTime = new Date(failedAtStr).getTime();
            if (!isNaN(confirmedTime) && !isNaN(failedTime) && confirmedTime >= failedTime) {
                return undefined;
            }
        }
        return failed.error.message;
    }

    /**
     * @deprecated Avoid using lastError as an active error flag in UI components.
     * Use component-level reactive activeError instead.
     * Retained as an alias to historicalError for backwards compatibility with diagnostic views.
     */
    get lastError(): string | undefined {
        return this.historicalError;
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
