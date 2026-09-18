import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { SiteDto } from '../domain/dtos/site.dto';
import { map, Observable } from 'rxjs';
import { SiteCard } from '../domain/models/site-card';
import { Site } from '../domain/models/site';
import { toObservable } from "@angular/core/rxjs-interop";
import { Environment } from './environment';
import { ClientLocationManagmentDto } from '@core/domain/dtos/client-location-managment.dto';
import { QueryResponse } from '@shared/abstractions/grid-response.dto';
import { TopologyNodeDto } from '@core/domain/dtos/topology-node.dto';
import { PermissionScope } from '@core/domain/models/permission-scope';
import { ClientLocationDto } from '@core/domain/dtos/client-location.dto';

@Injectable({
  providedIn: 'root',
})
export class SpaceService {
  #http = inject(HttpClient);
  #selectedSpace = signal<SiteCard | null>(null);
  #environment = inject(Environment);

  #apiUrl = `${this.#environment.apiUrl}/sites`;

  setSite(site: SiteCard): void {
    this.#selectedSpace.set(site);
  }

  selectedSite$ = toObservable(this.#selectedSpace);

  getAll(): Observable<QueryResponse<SiteCard>> {
    return this.#http.get<QueryResponse<ClientLocationManagmentDto>>(`${this.#apiUrl}`).pipe(
      map(({ items, totalCount, totalPages, currentPage, rowsByPage }: QueryResponse<ClientLocationManagmentDto>) => {
        items.map(site => new SiteCard(site));
        return {
          items: items.map((site: ClientLocationManagmentDto) => {
            return new SiteCard(site);
          }),
          totalCount,
          totalPages,
          currentPage,
          rowsByPage,
        };
      })
    );
  }

  findById(siteId: string): Observable<Site> {
    return this.#http.get<SiteDto>(`${this.#apiUrl}/${siteId}`).pipe(
      map((site: SiteDto) => {
        return new Site(site)
      })
    );
  }

  create(site: SiteDto): Observable<Site> {
    return this.#http.post<Site>(`${this.#apiUrl}`, site);
  }

  update(site: SiteDto): Observable<Site> {
    return this.#http.put<Site>(`${this.#apiUrl}/${site.id}`, {
      siteId: site.id,
      name: site.name,
      addressLine: site.addressLine,
      city: site.city,
      countryCode: site.countryCode || 'AR',
      locale: site.locale || 'es-AR',
      province: site.province,
      latitude: site.latitude,
      longitude: site.longitude,
      postalCode: site.postalCode,
      type: site.type,
      status: site.status,
      timezone: site.timezone || 'America/Argentina/Cordoba',
    });
  }

  inative(siteId: string): Observable<Site> {
    return this.#http.put<Site>(`${this.#apiUrl}/${siteId}/inative`, {
      siteId,
    });
  }

  active(siteId: string): Observable<Site> {
    return this.#http.put<Site>(`${this.#apiUrl}/${siteId}/active`, {
      siteId,
    });
  }

  delete(siteId: string): Observable<void> {
    return this.#http.delete<void>(`${this.#apiUrl}/${siteId}`);
  }

  getTopology(): Observable<PermissionScope[]> {
    return this.#http.get<TopologyNodeDto[]>(`${this.#apiUrl}/topology`, {
      withCredentials: true,
    }).pipe(map((topogyNodes: TopologyNodeDto[]) => topogyNodes.map(node => new PermissionScope(node))));
  }

}
