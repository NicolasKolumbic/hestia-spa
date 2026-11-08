export interface DeviceChannelPendingState {
    commandId: string;
    requestedState: {
        isOn: boolean;
        brightness?: number;
        color?: string;
    };
    requestedAt: string;
    requestedById?: string;
    status: 'IN_FLIGHT';
}

export interface DeviceChannelFailedState {
    commandId: string;
    error?: {
        code: string;
        message: string;
    };
    failedAt: string;
}

export interface DeviceChannelUncertainState {
    commandId: string;
    requestedState?: {
        isOn: boolean;
    };
    status: 'TIMED_OUT';
    reason: string;
    reconciledAt?: string;
    timedOutAt?: string;
}

export interface DeviceChannelPayload {
    brightness?: number;
    color?: string;
    pendingState?: DeviceChannelPendingState;
    lastFailedCommand?: DeviceChannelFailedState;
    lastUncertainCommand?: DeviceChannelUncertainState;
    lastConfirmedAt?: string;
    lastProcessedCommandId?: string;
    [key: string]: any;
}

export interface DeviceChannelDto {
    channelId: string;
    id?: string;
    deviceId: string;
    channelIndex: number;
    name: string;
    type: string;
    isPrimary: boolean;
    isOn: boolean;
    payload?: DeviceChannelPayload;
    // Legacy fields - kept for backwards compatibility
    brightness?: number;
    color?: string;
}
