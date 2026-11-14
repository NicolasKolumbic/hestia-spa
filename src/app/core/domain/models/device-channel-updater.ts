import { DeviceChannelDto, DeviceChannelPayload } from "../dtos/device-channel.dto";
import { DeviceChannel } from "./device-channel";

export interface MonotonicUpdateResult {
    /** The resolved channel instance */
    channel: DeviceChannel;
    /** Whether the incoming update was applied (true) or rejected/ignored (false) */
    applied: boolean;
    /** Explanation for audit/logging when an update is rejected or treated as duplicate */
    reason?:
        | 'STALE_IN_FLIGHT_AFTER_SUCCESS'
        | 'STALE_IN_FLIGHT_AFTER_FAILURE'
        | 'STALE_IN_FLIGHT_AFTER_UNCERTAIN'
        | 'OLDER_REQUESTED_TIMESTAMP'
        | 'OLDER_CONFIRMED_TIMESTAMP'
        | 'DUPLICATE_CONFIRMED'
        | 'DUPLICATE_IN_FLIGHT'
        | 'OUT_OF_ORDER_STALE_CONFIRMATION';
}

/**
 * Applies a centralized monotonic update to a DeviceChannel instance.
 * Guarantees that:
 * 1. A terminal confirmation (SUCCEEDED, FAILED, UNCERTAIN) cannot be reverted to IN_FLIGHT
 *    by a delayed HTTP snapshot for the same commandId.
 * 2. Duplicate events do not cause unnecessary object churn or regressions.
 * 3. Out-of-order events from older commands cannot overwrite newer confirmed or in-flight states.
 * 4. Timestamps are evaluated in conjunction with commandId and terminal status.
 * 5. Missing fields (such as flat deviceId, name, type) are safely preserved from the current channel.
 */
export function applyMonotonicUpdate(
    current: DeviceChannel,
    incoming: DeviceChannelDto
): MonotonicUpdateResult {
    const chId = current.channelId;
    const incomingPayload = (incoming.payload ?? {}) as DeviceChannelPayload;
    const currentPayload = (current.payload ?? {}) as DeviceChannelPayload;

    const incomingPending = incomingPayload.pendingState;
    const currentPending = currentPayload.pendingState;

    const currentProcessedCmdId = currentPayload.lastProcessedCommandId;
    const incomingProcessedCmdId = incomingPayload.lastProcessedCommandId;

    const currentFailedCmd = currentPayload.lastFailedCommand;
    const incomingFailedCmd = incomingPayload.lastFailedCommand;

    const currentUncertainCmd = currentPayload.lastUncertainCommand;
    const incomingUncertainCmd = incomingPayload.lastUncertainCommand;

    const currentConfirmedAt = currentPayload.lastConfirmedAt
        ? new Date(currentPayload.lastConfirmedAt).getTime()
        : 0;
    const incomingConfirmedAt = incomingPayload.lastConfirmedAt
        ? new Date(incomingPayload.lastConfirmedAt).getTime()
        : 0;

    // Helper to safely merge DTO preserving existing core metadata if omitted
    const createMergedDto = (targetIsOn: boolean): DeviceChannelDto => ({
        channelId: chId,
        deviceId: incoming.deviceId || current.deviceId,
        channelIndex: incoming.channelIndex !== undefined ? incoming.channelIndex : current.channelIndex,
        name: incoming.name || current.name,
        type: (incoming.type || current.type) as any,
        isPrimary: incoming.isPrimary !== undefined ? incoming.isPrimary : current.isPrimary,
        isOn: targetIsOn,
        payload: incomingPayload,
    });

    // =========================================================================
    // BRANCH A: Incoming is IN_FLIGHT (has pendingState)
    // (e.g. from HTTP PUT snapshot or initial WebSocket 'channelUpdate')
    // =========================================================================
    if (incomingPending && incomingPending.status === 'IN_FLIGHT') {
        const incomingCmdId = incomingPending.commandId;

        // A.1: Command was already confirmed as SUCCEEDED
        if (currentProcessedCmdId && currentProcessedCmdId === incomingCmdId) {
            return {
                channel: current,
                applied: false,
                reason: 'STALE_IN_FLIGHT_AFTER_SUCCESS',
            };
        }

        // A.2: Command was already recorded as FAILED
        if (currentFailedCmd && currentFailedCmd.commandId === incomingCmdId) {
            return {
                channel: current,
                applied: false,
                reason: 'STALE_IN_FLIGHT_AFTER_FAILURE',
            };
        }

        // A.3: Command was already recorded as UNCERTAIN / TIMED_OUT
        if (currentUncertainCmd && currentUncertainCmd.commandId === incomingCmdId) {
            return {
                channel: current,
                applied: false,
                reason: 'STALE_IN_FLIGHT_AFTER_UNCERTAIN',
            };
        }

        // A.4: Timestamp check: incoming pending was requested BEFORE the current confirmed state
        if (incomingPending.requestedAt && currentConfirmedAt > 0) {
            const reqTime = new Date(incomingPending.requestedAt).getTime();
            if (!isNaN(reqTime) && reqTime < currentConfirmedAt) {
                return {
                    channel: current,
                    applied: false,
                    reason: 'OLDER_REQUESTED_TIMESTAMP',
                };
            }
        }

        // A.5: Duplicate pendingState check
        if (
            currentPending &&
            currentPending.commandId === incomingCmdId &&
            currentPending.status === 'IN_FLIGHT' &&
            currentPending.requestedState?.isOn === incomingPending.requestedState?.isOn &&
            currentPending.requestedState?.brightness === incomingPending.requestedState?.brightness &&
            currentPending.requestedState?.color === incomingPending.requestedState?.color
        ) {
            return {
                channel: current,
                applied: false,
                reason: 'DUPLICATE_IN_FLIGHT',
            };
        }

        // Valid new IN_FLIGHT state: accept update
        // Preserve current physical isOn; do not mutate physical state prematurely
        return {
            channel: new DeviceChannel(createMergedDto(current.isOn)),
            applied: true,
        };
    }

    // =========================================================================
    // BRANCH B: Incoming is NOT IN_FLIGHT (Terminal Confirmation / Full Authoritative DTO)
    // (e.g. from WebSocket final confirmation, reconciliation GET, or state update)
    // =========================================================================

    // B.1: Duplicate confirmed state check
    const isSameIsOn = incoming.isOn === current.isOn;
    const isSameProcessed = incomingProcessedCmdId === currentProcessedCmdId;
    const isSameConfirmedAt = incomingPayload.lastConfirmedAt === currentPayload.lastConfirmedAt;
    const isSameFailed = incomingFailedCmd?.commandId === currentFailedCmd?.commandId;
    const isSameUncertain = incomingUncertainCmd?.commandId === currentUncertainCmd?.commandId;

    if (
        !currentPending &&
        isSameIsOn &&
        isSameProcessed &&
        isSameConfirmedAt &&
        isSameFailed &&
        isSameUncertain
    ) {
        return {
            channel: current,
            applied: false,
            reason: 'DUPLICATE_CONFIRMED',
        };
    }

    // B.2: Out-of-order check: incoming confirmed timestamp is older than current confirmed timestamp
    if (incomingConfirmedAt > 0 && currentConfirmedAt > 0 && incomingConfirmedAt < currentConfirmedAt) {
        return {
            channel: current,
            applied: false,
            reason: 'OLDER_CONFIRMED_TIMESTAMP',
        };
    }

    // B.3: Out-of-order check: current is already running a NEWER pending command
    if (currentPending && currentPending.requestedAt && incomingConfirmedAt > 0) {
        const currentReqTime = new Date(currentPending.requestedAt).getTime();
        // If the incoming confirmation happened BEFORE the current pending command was even requested,
        // it belongs to an older command that finished late. It must NOT wipe out the current pending state!
        if (
            !isNaN(currentReqTime) &&
            incomingConfirmedAt < currentReqTime &&
            incomingProcessedCmdId !== currentPending.commandId
        ) {
            return {
                channel: current,
                applied: false,
                reason: 'OUT_OF_ORDER_STALE_CONFIRMATION',
            };
        }
    }

    // B.4: Valid confirmation or authoritative state:
    // If incoming resolves current pending command as FAILED:
    // Retain current confirmed isOn (physical state was not altered by failed command)
    const isFailureResolution =
        currentPending &&
        incomingFailedCmd &&
        incomingFailedCmd.commandId === currentPending.commandId;

    const resolvedIsOn = isFailureResolution ? current.isOn : incoming.isOn;

    return {
        channel: new DeviceChannel(createMergedDto(resolvedIsOn)),
        applied: true,
    };
}
