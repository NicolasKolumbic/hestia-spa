import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { SiteDto } from '../domain/dtos/site.dto';
import { map, Observable } from 'rxjs';
import { Site } from '../domain/models/site';
import { toObservable } from "@angular/core/rxjs-interop";
import { Environment } from './environment';
import { ClientLocationManagmentDto } from '@core/domain/dtos/client-location-managment.dto';
import { QueryResponse } from '@shared/abstractions/grid-response.dto';

@Injectable({
  providedIn: 'root',
})
export class SpaceService {
  #http = inject(HttpClient);
  #selectedSpace = signal<Site | null>(null);
  #environment = inject(Environment);

  #apiUrl = `${this.#environment.apiUrl}/sites`;

  setSite(site: Site): void {
    this.#selectedSpace.set(site);
  }

  selectedSite$ = toObservable(this.#selectedSpace);

  getAll(): Observable<QueryResponse<Site>> {
    return this.#http.get<QueryResponse<ClientLocationManagmentDto>>(`${this.#apiUrl}`).pipe(
      map(({ items, totalCount, totalPages, currentPage, rowsByPage }: QueryResponse<ClientLocationManagmentDto>) => {
        items.map(site => new Site(site));
        return {
          items: items.map((site: ClientLocationManagmentDto) => {
            return new Site(site);
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
    return this.#http.get<ClientLocationManagmentDto>(`${this.#apiUrl}/${siteId}`).pipe(
      map((site: ClientLocationManagmentDto) => new Site(site))
    );
  }

  create(site: SiteDto): Observable<Site> {
    return this.#http.post<Site>(`${this.#apiUrl}`, site);
  }

  update(site: SiteDto): Observable<Site> {
    return this.#http.put<Site>(`${this.#apiUrl}/${site.siteId}`, site);
  }

  delete(siteId: string): Observable<void> {
    return this.#http.delete<void>(`${this.#apiUrl}/${siteId}`);
  }
}
