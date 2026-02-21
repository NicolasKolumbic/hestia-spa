import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { DeviceDto } from '../domain/dtos/device.dto';
import { WebSocketService } from './websocket.service';
import { DeviceChannelDto } from '../domain/dtos/device-channel.dto';
import { Device } from '@core/domain/models/device';

@Injectable({
    providedIn: 'root'
})
export class DeviceService {
    #http = inject(HttpClient);
    #ws = inject(WebSocketService);

    readonly devices = signal<Device[]>([]);

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
            tap(devices => this.devices.set(devices))
        ).pipe(map(devices => devices.map(device => new Device(device))));
    }

    updateChannelState(channelId: string, state: Partial<DeviceChannelDto>): Observable<DeviceChannelDto> {
        return this.#http.put<DeviceChannelDto>(`http://localhost:3000/api/device-channels/${channelId}`, state).pipe(
            tap(updatedChannel => {
                // Optimistic update or wait for WebSocket? 
                // We'll update locally to feel instant, WebSocket will confirm or valid other clients
                this.updateLocalDeviceChannel(updatedChannel);
            })
        );
    }

    private updateLocalDeviceChannel(updatedChannel: DeviceChannelDto): void {
        this.devices.update((devices: DeviceDto[]) => devices.map((device: DeviceDto) => {
            if (device.deviceId === updatedChannel.deviceId) {
                return {
                    ...device,
                    channels: device.channels.map(channel => channel.channelId === updatedChannel.channelId ? updatedChannel : channel)
                };
            }
            return device;
        }));
    }
}
