import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { SiteDto } from '../domain/dtos/site.dto';
import { map, Observable } from 'rxjs';
import { Site } from '../domain/models/site';
import { toObservable } from "@angular/core/rxjs-interop";
import { Environment } from './environment';

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

  getAll(): Observable<Site[]> {
    return this.#http.get<SiteDto[]>(`${this.#apiUrl}`).pipe(
      map((sites: SiteDto[]) => sites.map(site => new Site(site.siteId, site.name, site.type, site.addressLine)))
    );
  }

  findById(siteId: string): Observable<Site> {
    return this.#http.get<SiteDto>(`${this.#apiUrl}/${siteId}`).pipe(
      map((site: SiteDto) => new Site(site.siteId, site.name, site.type, site.addressLine))
    );
  }

  create(site: SiteDto): Observable<Site> {
    return this.#http.post<SiteDto>(`${this.#apiUrl}`, site).pipe(
      map((site: SiteDto) => new Site(site.siteId, site.name, site.type, site.addressLine))
    );
  }

  update(site: SiteDto): Observable<Site> {
    return this.#http.put<SiteDto>(`${this.#apiUrl}/${site.siteId}`, site).pipe(
      map((site: SiteDto) => new Site(site.siteId, site.name, site.type, site.addressLine))
    );
  }

  delete(siteId: string): Observable<void> {
    return this.#http.delete<void>(`${this.#apiUrl}/${siteId}`);
  }
}
