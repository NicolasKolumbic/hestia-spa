import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Zone } from '../domain/models/zone';
import { Environment } from './environment';

@Injectable({
  providedIn: 'root',
})
export class ZoneService {
  #http = inject(HttpClient);
  #environment = inject(Environment);

  getAllZones(): Observable<Zone[]> {
    return this.#http.get<Zone[]>(`${this.#environment.apiUrl}/zones`);
  }

  updateZone(zone: Zone): Observable<Zone> {
    return this.#http.put<Zone>(`${this.#environment.apiUrl}/zones/${zone.zoneId}`, zone);
  }

  deleteZone(zoneId: string): Observable<void> {
    return this.#http.delete<void>(`${this.#environment.apiUrl}/zones/${zoneId}`);
  }

  createZone(zone: Zone): Observable<Zone> {
    return this.#http.post<Zone>(`${this.#environment.apiUrl}/zones`, zone);
  }
}
