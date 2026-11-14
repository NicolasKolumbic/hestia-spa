import { computed, inject, Injectable, OnDestroy, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, Subscription, tap, throwError } from 'rxjs';
import { DeviceDto } from '../domain/dtos/device.dto';
import { WebSocketService } from './websocket.service';
import { DeviceChannelDto, DeviceChannelPayload } from '../domain/dtos/device-channel.dto';
import { Device } from '@core/domain/models/device';
import { DeviceChannel } from '@core/domain/models/device-channel';
import { applyMonotonicUpdate } from '@core/domain/models/device-channel-updater';
import {
    CLIMATE_CHANNEL_TYPES,
    ENERGY_CHANNEL_TYPES,
    LIGHTING_CHANNEL_TYPES,
    SECURITY_CHANNEL_TYPES,
} from '@core/domain/models/device-channel-type';
import { Environment } from './environment';

@Injectable({
    providedIn: 'root'
})
export class DeviceService implements OnDestroy {
    #http = inject(HttpClient);
    #ws = inject(WebSocketService);
    #environment = inject(Environment);

    #apiUrl = `${this.#environment.apiUrl}/devices`;
    #channelApiUrl = `${this.#environment.apiUrl}/device-channels`;

    readonly devices = signal<Device[]>([]);

    /**
     * Parameterizable watchdog timeout in milliseconds.
     * Default: 8,500 ms (just above Gateway timeout 5,000 ms and Cloud timeout 8,000 ms).
     */
    watchdogTimeoutMs = 8500;

    /** Maximum reconciliation polling attempts per in-flight command before marking uncertain */
    readonly maxReconciliationAttempts = 2;

    /** Active watchdog timers keyed by channelId */
    private readonly activeWatchdogs = new Map<string, { timer: any; commandId: string; attempts: number }>();

    /** Active HTTP reconciliation subscriptions keyed by channelId */
    private readonly activeReconciliations = new Map<string, Subscription>();

    /** Centralized subscription tracker for WebSocket events */
    private wsSubscriptions: Subscription[] = [];

    // -- Category computed signals --
    readonly lightingDevices = computed(() =>
        this.devices().filter(d =>
            d.channels.some(ch => (LIGHTING_CHANNEL_TYPES as string[]).includes(ch.type))
        )
    );

    readonly climateDevices = computed(() =>
        this.devices().filter(d =>
            d.channels.some(ch => (CLIMATE_CHANNEL_TYPES as string[]).includes(ch.type))
        )
    );

    readonly energyDevices = computed(() =>
        this.devices().filter(d =>
            d.channels.some(ch => (ENERGY_CHANNEL_TYPES as string[]).includes(ch.type))
        )
    );

    readonly securityDevices = computed(() =>
        this.devices().filter(d =>
            d.channels.some(ch => (SECURITY_CHANNEL_TYPES as string[]).includes(ch.type))
        )
    );

    readonly cameraDevices = computed(() =>
        this.devices()
    );

    constructor() {
        this.#ws.connect();

        // 1. Listen for confirmed physical state or in-flight updates from Cloud
        const channelSub = this.#ws.listen<DeviceChannelDto>('channelUpdate').subscribe(updatedChannel => {
            this.updateLocalDeviceChannel(updatedChannel);
        });
        this.wsSubscriptions.push(channelSub);

        // 2. Recovery on socket reconnect: fetch authoritative state from Cloud
        const connectSub = this.#ws.listen('connect').subscribe(() => {
            this.getAllDevices().subscribe();
        });
        this.wsSubscriptions.push(connectSub);
    }

    ngOnDestroy(): void {
        // 1. Clean up all active watchdog timers
        for (const [channelId] of this.activeWatchdogs) {
            this.cancelWatchdog(channelId);
        }
        this.activeWatchdogs.clear();

        // 2. Cancel any pending HTTP reconciliations
        for (const [, sub] of this.activeReconciliations) {
            sub.unsubscribe();
        }
        this.activeReconciliations.clear();

        // 3. Unsubscribe WebSocket listeners
        for (const sub of this.wsSubscriptions) {
            sub.unsubscribe();
        }
        this.wsSubscriptions = [];
    }

    createDevice(device: Partial<DeviceDto>): Observable<Device> {
        return this.#http.post<DeviceDto>(`${this.#apiUrl}`, device).pipe(
            map(deviceDto => new Device(deviceDto)),
            tap(newDevice => {
                this.devices.update(devices => [...devices, newDevice]);
            })
        );
    }

    getAllDevices(): Observable<Device[]> {
        return this.#http.get<DeviceDto[]>(`${this.#apiUrl}`).pipe(
            map(devices => devices.map(device => new Device(device))),
            tap(devices => this.devices.set(devices))
        );
    }

    /**
     * Retrieves authoritative state for a single channel from Cloud.
     */
    getChannelById(channelId: string): Observable<DeviceChannelDto> {
        return this.#http.get<DeviceChannelDto>(`${this.#channelApiUrl}/${channelId}`);
    }

    /**
     * Updates channel state via PUT /api/device-channels/:id.
     * Enforces monotonic state updates and starts a safety watchdog for in-flight tracking.
     */
    updateChannelState(channelId: string, state: Partial<DeviceChannelDto>): Observable<DeviceChannelDto> {
        return this.#http.put<DeviceChannelDto>(`${this.#channelApiUrl}/${channelId}`, state).pipe(
            tap(updatedChannel => {
                this.updateLocalDeviceChannel(updatedChannel);
            }),
            catchError((err: HttpErrorResponse) => {
                console.error(`Failed to update channel ${channelId}:`, err);
                this.cancelWatchdog(channelId);
                return throwError(() => err);
            })
        );
    }

    /**
     * Centralized monotonic channel updater.
     * Robustly locates the channel by channelId (even if deviceId is omitted),
     * validates device membership, applies the monotonic rules, and manages
     * the watchdog timer lifecycle.
     * 
     * @returns boolean true if the state was updated, false if rejected or duplicate.
     */
    updateLocalDeviceChannel(updatedChannel: DeviceChannelDto): boolean {
        const chId = updatedChannel.channelId || (updatedChannel as any).id;
        if (!chId) return false;

        const targetDeviceId = updatedChannel.deviceId;
        let updateApplied = false;

        this.devices.update((devices: Device[]) => {
            // Find owning device:
            // First try matching targetDeviceId if provided, or search across all devices
            let owningDevice = devices.find(d => d.channels.some(ch => ch.channelId === chId));

            if (!owningDevice) {
                return devices;
            }

            // Membership validation: if targetDeviceId is explicitly specified but differs from owning device, reject
            if (targetDeviceId && owningDevice.deviceId !== targetDeviceId) {
                console.warn(
                    `Rejected channel update for ${chId}: belongs to device ${owningDevice.deviceId}, not ${targetDeviceId}`
                );
                return devices;
            }

            return devices.map((device: Device) => {
                if (device.deviceId !== owningDevice.deviceId) {
                    return device;
                }

                const updatedChannels = device.channels.map(existingChannel => {
                    if (existingChannel.channelId !== chId) {
                        return existingChannel;
                    }

                    const result = applyMonotonicUpdate(existingChannel, updatedChannel);
                    if (result.applied) {
                        updateApplied = true;
                        return result.channel;
                    }
                    return existingChannel;
                });

                if (!updateApplied) {
                    return device;
                }

                return Object.assign(Object.create(Object.getPrototypeOf(device)), device, { channels: updatedChannels });
            });
        });

        // Watchdog lifecycle: start watchdog if channel is now IN_FLIGHT; cancel if resolved
        if (updateApplied) {
            const currentChannel = this.findChannelById(chId);
            if (currentChannel && currentChannel.isPending && currentChannel.pendingCommandId) {
                this.startWatchdog(chId, currentChannel.pendingCommandId);
            } else {
                this.cancelWatchdog(chId);
            }
        }

        return updateApplied;
    }

    /**
     * Finds a channel across all loaded devices by channelId.
     */
    findChannelById(channelId: string): DeviceChannel | undefined {
        for (const device of this.devices()) {
            const ch = device.channels.find(c => c.channelId === channelId);
            if (ch) return ch;
        }
        return undefined;
    }

    /**
     * Starts a watchdog timer for a channel that entered IN_FLIGHT state.
     */
    startWatchdog(channelId: string, commandId: string, attempt = 1): void {
        this.cancelWatchdog(channelId);

        const timeout = attempt === 1 ? this.watchdogTimeoutMs : 2500;
        const timer = setTimeout(() => {
            this.handleWatchdogTimeout(channelId, commandId, attempt);
        }, timeout);

        this.activeWatchdogs.set(channelId, { timer, commandId, attempts: attempt });
    }

    /**
     * Cancels an active watchdog timer and any pending HTTP reconciliation for a channel.
     */
    cancelWatchdog(channelId: string): void {
        const existing = this.activeWatchdogs.get(channelId);
        if (existing) {
            clearTimeout(existing.timer);
            this.activeWatchdogs.delete(channelId);
        }

        const existingSub = this.activeReconciliations.get(channelId);
        if (existingSub) {
            existingSub.unsubscribe();
            this.activeReconciliations.delete(channelId);
        }
    }

    /**
     * Handles watchdog timeout by querying Cloud authoritative state via GET /api/device-channels/:id.
     */
    private handleWatchdogTimeout(channelId: string, commandId: string, attempt: number): void {
        const channel = this.findChannelById(channelId);
        // Verify channel is still pending this exact command
        if (!channel || !channel.isPending || channel.pendingCommandId !== commandId) {
            this.cancelWatchdog(channelId);
            return;
        }

        console.warn(
            `Watchdog triggered for channel ${channelId} (command ${commandId}, attempt ${attempt}/${this.maxReconciliationAttempts})`
        );

        const sub = this.getChannelById(channelId).subscribe({
            next: (authoritativeChannel) => {
                this.activeReconciliations.delete(channelId);
                const isStillPendingInCloud = authoritativeChannel.payload?.pendingState?.status === 'IN_FLIGHT';

                if (isStillPendingInCloud) {
                    if (attempt < this.maxReconciliationAttempts) {
                        // Re-schedule second and final attempt
                        this.startWatchdog(channelId, commandId, attempt + 1);
                    } else {
                        // Max attempts reached without physical resolution from hardware: mark uncertain
                        this.cancelWatchdog(channelId);
                        this.markChannelUncertain(
                            channelId,
                            commandId,
                            'Tiempo de espera agotado sin confirmación física del servidor'
                        );
                    }
                } else {
                    // Cloud has confirmed terminal state (SUCCEEDED or FAILED)
                    this.cancelWatchdog(channelId);
                    this.updateLocalDeviceChannel(authoritativeChannel);
                }
            },
            error: (err: HttpErrorResponse) => {
                this.activeReconciliations.delete(channelId);
                this.cancelWatchdog(channelId);
                console.error(`Watchdog reconciliation request failed for channel ${channelId}:`, err);
                // Network or server error during reconciliation: mark uncertain to unlock UI safely
                this.markChannelUncertain(
                    channelId,
                    commandId,
                    'Error de conexión al verificar el estado del canal'
                );
            }
        });

        this.activeReconciliations.set(channelId, sub);
    }

    /**
     * Marks a channel as UNCERTAIN / TIMED_OUT, preserving confirmed physical isOn and unlocking the UI.
     */
    markChannelUncertain(channelId: string, commandId: string, reason: string): void {
        const channel = this.findChannelById(channelId);
        if (!channel) return;

        const updatedPayload: DeviceChannelPayload = {
            ...(channel.payload || {}),
            lastUncertainCommand: {
                commandId,
                requestedState: channel.payload?.pendingState?.requestedState,
                status: 'TIMED_OUT',
                reason,
                reconciledAt: new Date().toISOString(),
                timedOutAt: new Date().toISOString(),
            },
        };
        delete updatedPayload.pendingState;

        const uncertainDto: DeviceChannelDto = {
            channelId,
            deviceId: channel.deviceId,
            channelIndex: channel.channelIndex,
            name: channel.name,
            type: channel.type,
            isPrimary: channel.isPrimary,
            isOn: channel.isOn, // Strictly preserves confirmed physical state
            payload: updatedPayload,
        };

        this.updateLocalDeviceChannel(uncertainDto);
    }
}
