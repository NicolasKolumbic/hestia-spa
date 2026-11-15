import { DeviceChannelDto } from '../domain/dtos/device-channel.dto';

export interface WsFaultTarget {
    channelId: string;
    commandId?: string;
}

/**
 * Diagnostic utility for development and testing environments.
 * Allows simulating the loss of exactly one terminal WebSocket 'channelUpdate' event
 * for a specific channel to verify the client-side reconciliation watchdog.
 * 
 * Rules:
 * 1. Targets only the specified channelId (and optional commandId).
 * 2. Never drops IN_FLIGHT events.
 * 3. Never drops events for other channels.
 * 4. Automatically disarms after dropping exactly one terminal event (one-shot).
 * 5. Logs every drop to console.warn.
 * 6. Attaches to window.hestiaFaultInjector in browser development runtime.
 */
export class WsFaultInjector {
    private target: WsFaultTarget | null = null;
    private active = false;

    constructor() {
        if (typeof window !== 'undefined') {
            (window as any).hestiaFaultInjector = this;
        }
    }

    /**
     * Arms the fault injector to intercept and drop the next terminal channelUpdate
     * for the specified channelId (and optional commandId).
     */
    arm(channelId: string, commandId?: string): void {
        if (!channelId) {
            console.error('[HESTIA FAULT INJECTOR] Error: channelId is required to arm fault injector.');
            return;
        }

        this.target = { channelId, commandId };
        this.active = true;
        console.warn(
            `[HESTIA FAULT INJECTOR] ARMED: Ready to drop exactly 1 terminal channelUpdate for channel ${channelId}` +
            (commandId ? ` (command: ${commandId})` : '')
        );
    }

    /**
     * Disarms the fault injector manually.
     */
    disarm(): void {
        this.target = null;
        this.active = false;
        console.log('[HESTIA FAULT INJECTOR] DISARMED: Normal event processing restored.');
    }

    /**
     * Evaluates whether an incoming channelUpdate should be dropped.
     * Returns true if dropped (and immediately disarms), false if allowed.
     */
    shouldDrop(updatedChannel: DeviceChannelDto): boolean {
        if (!this.active || !this.target) {
            return false;
        }

        const chId = updatedChannel.channelId || (updatedChannel as any).id;
        if (!chId || chId !== this.target.channelId) {
            // Event is for a different channel -> allow through
            return false;
        }

        // Rule: Never drop IN_FLIGHT events (HTTP PUT or initial WS progress)
        const isPending =
            !!updatedChannel.payload?.pendingState &&
            updatedChannel.payload.pendingState.status === 'IN_FLIGHT';
        if (isPending) {
            return false;
        }

        // If a specific commandId was targeted, verify match
        if (this.target.commandId) {
            const processedId = updatedChannel.payload?.lastProcessedCommandId;
            const failedId = updatedChannel.payload?.lastFailedCommand?.commandId;
            const uncertainId = updatedChannel.payload?.lastUncertainCommand?.commandId;

            const matchesCommand =
                processedId === this.target.commandId ||
                failedId === this.target.commandId ||
                uncertainId === this.target.commandId;

            if (!matchesCommand) {
                return false;
            }
        }

        // Terminal event for targeted channel matched -> DROP IT
        console.warn(
            `[HESTIA FAULT INJECTOR] Intercepted and DROPPED terminal channelUpdate for channel ${chId} ` +
            `(isOn: ${updatedChannel.isOn}, cmd: ${updatedChannel.payload?.lastProcessedCommandId || 'unknown'}). ` +
            `Simulating packet loss to verify Watchdog reconciliation.`
        );

        // One-shot: automatically disarm after dropping
        this.disarm();
        return true;
    }

    /**
     * Indicates whether the injector is currently armed.
     */
    isActive(): boolean {
        return this.active;
    }

    /**
     * Returns the currently targeted channel and command if armed.
     */
    getTarget(): WsFaultTarget | null {
        return this.target ? { ...this.target } : null;
    }

    /**
     * Prints status to console (useful when called directly from Chrome DevTools console).
     */
    status(): { active: boolean; target: WsFaultTarget | null } {
        const state = { active: this.active, target: this.getTarget() };
        console.log('[HESTIA FAULT INJECTOR] Status:', state);
        return state;
    }
}
