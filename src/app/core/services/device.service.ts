import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { DeviceDto } from '../domain/dtos/device.dto';
import { WebSocketService } from './websocket.service';
import { DeviceChannelDto } from '../domain/dtos/device-channel.dto';
import { Device } from '@core/domain/models/device';
import {
    CLIMATE_CHANNEL_TYPES,
    ENERGY_CHANNEL_TYPES,
    LIGHTING_CHANNEL_TYPES,
    SECURITY_CHANNEL_TYPES,
} from '@core/domain/models/device-channel-type';

@Injectable({
    providedIn: 'root'
})
export class DeviceService {
    #http = inject(HttpClient);
    #ws = inject(WebSocketService);

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

    constructor() {
        this.#ws.connect();
        this.#ws.listen<DeviceChannelDto>('channelUpdate').subscribe(updatedChannel => {
            this.updateLocalDeviceChannel(updatedChannel);
        });
    }

    createDevice(device: Partial<DeviceDto>): Observable<Device> {
        return this.#http.post<DeviceDto>('http://localhost:3000/api/devices', device).pipe(
            map(deviceDto => new Device(deviceDto)),
            tap(newDevice => {
                this.devices.update(devices => [...devices, newDevice]);
            })
        );
    }

    getAllDevices(): Observable<Device[]> {
        return this.#http.get<DeviceDto[]>('http://localhost:3000/api/devices').pipe(
            map(devices => devices.map(device => new Device(device))),
            tap(devices => this.devices.set(devices))
        );
    }

    updateChannelState(channelId: string, state: Partial<DeviceChannelDto>): Observable<DeviceChannelDto> {
        return this.#http.put<DeviceChannelDto>(`http://localhost:3000/api/device-channels/${channelId}`, state).pipe(
            tap(updatedChannel => {
                this.updateLocalDeviceChannel(updatedChannel);
            })
        );
    }

    private updateLocalDeviceChannel(updatedChannel: DeviceChannelDto): void {
        this.devices.update((devices: Device[]) => devices.map((device: Device) => {
            if (device.deviceId === updatedChannel.deviceId) {
                const updatedChannels = device.channels.map(ch =>
                    ch.channelId === updatedChannel.channelId
                        ? new (ch.constructor as any)(updatedChannel)
                        : ch
                );
                return { ...device, channels: updatedChannels };
            }
            return device;
        }));
    }
}
