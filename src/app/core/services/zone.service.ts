import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Zone } from '../domain/models/zone';

@Injectable({
  providedIn: 'root',
})
export class ZoneService {
  #http = inject(HttpClient);

  getAllZones(): Observable<Zone[]> {
    return this.#http.get<Zone[]>('http://localhost:3000/api/zones');
  }

  updateZone(zone: Zone): Observable<Zone> {
    return this.#http.put<Zone>(`http://localhost:3000/api/zones/${zone}`, zone);
  }

  deleteZone(zoneId: string): Observable<void> {
    return this.#http.delete<void>(`http://localhost:3000/api/zones/${zoneId}`);
  }

  createZone(zone: Zone): Observable<Zone> {
    return this.#http.post<Zone>('http://localhost:3000/api/zones', zone);
  }
}
