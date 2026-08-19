import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Socket } from 'ngx-socket-io';
import { BehaviorSubject, Observable } from 'rxjs';
import { DeviceChannel } from '@core/domain/models/device-channel';

@Injectable({
  providedIn: 'root',
})
export class DeviceTwoService {
  private readonly API_URL = 'api/devices';

  // Estado local reactivo de los canales de la zona actual
  private channelsSubject = new BehaviorSubject<DeviceChannel[]>([]);
  public channels$ = this.channelsSubject.asObservable();

  constructor(private http: HttpClient, private socket: Socket) {
    this.listenToDeviceChanges();
  }

  // 1. Escuchar actualizaciones vía WebSocket (Real-time)
  private listenToDeviceChanges() {
    this.socket.fromEvent('device_status_changed').subscribe((payload) => {
      const currentChannels = this.channelsSubject.value;
      const index = currentChannels.findIndex(c => c.channelId === payload.channelId);

      if (index !== -1) {
        // Actualizamos solo el canal que cambió (inmutabilidad)
        currentChannels[index] = { ...currentChannels[index], ...payload.changes };
        this.channelsSubject.next([...currentChannels]);
      }
    });
  }

  // 2. Cargar canales iniciales por zona
  loadChannelsByZone(zoneId: string) {
    this.http.get<DeviceChannel[]>(`${this.API_URL}/zones/${zoneId}/channels`)
      .subscribe(data => this.channelsSubject.next(data));
  }

  // 3. Acción de control (Optimistic Update)
  toggleChannel(channelId: string, newState: boolean) {
    // Podrías actualizar el UI antes de la respuesta del server para que se sienta instantáneo
    return this.http.patch(`${this.API_URL}/channels/${channelId}`, { isOn: newState });
  }
}
