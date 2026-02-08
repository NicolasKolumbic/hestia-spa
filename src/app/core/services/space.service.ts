import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SiteDto } from '../domain/dtos/site.dto';
import { map, Observable } from 'rxjs';
import { Site } from '../domain/models/site';

@Injectable({
  providedIn: 'root',
})
export class SpaceService {
  http = inject(HttpClient);

  getAll(): Observable<Site[]> {
    return this.http.get<Site[]>('http://localhost:3000/api/sites').pipe(
      map((sites: SiteDto[]) => sites.map(site => new Site(site.siteId, site.name, site.icon, site.address)))
    );
  }
}
