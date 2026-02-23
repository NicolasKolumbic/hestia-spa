import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DeviceType } from '../domain/models/device-type';
import { environment } from 'src/environments/environment';
import { Environment } from './environment';

@Injectable({
  providedIn: 'root',
})
export class DeviceTypeService {
  #http = inject(HttpClient);
  #environment = inject(Environment);

  private readonly apiUrl = `${this.#environment.apiUrl}/device-types`;

  findAll(): Observable<DeviceType[]> {
    return this.#http.get<DeviceType[]>(this.apiUrl);
  }

  findById(id: string): Observable<DeviceType> {
    return this.#http.get<DeviceType>(`${this.apiUrl}/${id}`);
  }

  create(deviceType: Partial<DeviceType>): Observable<DeviceType> {
    return this.#http.post<DeviceType>(this.apiUrl, deviceType);
  }

  update(id: string, deviceType: Partial<DeviceType>): Observable<DeviceType> {
    return this.#http.put<DeviceType>(`${this.apiUrl}/${id}`, deviceType);
  }

  delete(id: string): Observable<void> {
    return this.#http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
