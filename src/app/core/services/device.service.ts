import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { DeviceDto } from '../domain/dtos/device.dto';
import { WebSocketService } from './websocket.service';
import { DeviceChannelDto } from '../domain/dtos/device-channel.dto';
import { Device } from '@core/domain/models/device';
import { DeviceChannel } from '@core/domain/models/device-channel';
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
export class DeviceService {
    #http = inject(HttpClient);
    #ws = inject(WebSocketService);
    #environment = inject(Environment);

    #apiUrl = `${this.#environment.apiUrl}/devices`;
    #channelApiUrl = `${this.#environment.apiUrl}/device-channels`;

    readonly devices = signal<Device[]>([]);

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
        this.#ws.listen<DeviceChannelDto>('channelUpdate').subscribe(updatedChannel => {
            this.updateLocalDeviceChannel(updatedChannel);
        });

        // 2. Recovery on socket reconnect: fetch authoritative state from Cloud
        this.#ws.listen('connect').subscribe(() => {
            this.getAllDevices().subscribe();
        });
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
     * Updates channel state via PUT /api/device-channels/:id.
     * Cloud retains confirmed physical state in isOn and returns pendingState in payload.
     * When confirmed, Cloud emits channelUpdate via WebSocket to update signals definitively.
     */
    updateChannelState(channelId: string, state: Partial<DeviceChannelDto>): Observable<DeviceChannelDto> {
        return this.#http.put<DeviceChannelDto>(`${this.#channelApiUrl}/${channelId}`, state).pipe(
            tap(updatedChannel => {
                this.updateLocalDeviceChannel(updatedChannel);
            }),
            catchError((err: HttpErrorResponse) => {
                console.error(`Failed to update channel ${channelId}:`, err);
                return throwError(() => err);
            })
        );
    }

    private updateLocalDeviceChannel(updatedChannel: DeviceChannelDto): void {
        const chId = updatedChannel.channelId || (updatedChannel as any).id;
        this.devices.update((devices: Device[]) => devices.map((device: Device) => {
            if (device.deviceId === updatedChannel.deviceId) {
                const updatedChannels = device.channels.map(ch =>
                    ch.channelId === chId
                        ? new DeviceChannel({ ...updatedChannel, channelId: chId })
                        : ch
                );
                return Object.assign(Object.create(Object.getPrototypeOf(device)), device, { channels: updatedChannels });
            }
            return device;
        }));
    }
}
