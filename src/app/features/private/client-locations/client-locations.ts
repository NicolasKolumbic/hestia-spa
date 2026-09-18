import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SectionWrapper } from "@shared/components/section-wrapper/section-wrapper";
import { ClientLocationCard } from "./components/client-location-card/client-location-card";
import { SiteCard, SpaceService } from '@core/index';
import { RenderMap } from '@shared/directives/render-map';
import { Button } from '@shared/components/button/button';
import { CardModule } from 'primeng/card';
import { Button as ngButton } from 'primeng/button';

@Component({
  selector: 'hta-client-locations',
  imports: [Button, SectionWrapper, RenderMap, CardModule, ngButton, ClientLocationCard],
  templateUrl: './client-locations.html',
  styleUrl: './client-locations.css',
})
export class ClientLocations implements OnInit {
  #spaceService = inject(SpaceService);
  #router = inject(Router);

  sites = signal<SiteCard[]>([]);
  selectedSite = signal<SiteCard | null>(null);

  ngOnInit(): void {
    this.loadSites();
  }

  newSite(id?: string): void {
    const route = id ? ['/platform/clients-locations', id] : ['/platform/clients-locations'];
    this.#router.navigate(route);
  }

  selectSite(site: SiteCard): void {
    this.selectedSite.set(site);
  }

  loadSites(): void {
    this.#spaceService.getAll().subscribe((response) => {
      this.sites.set(response.items);
      if (response.items.length > 0 && !this.selectedSite()) {
        this.selectedSite.set(response.items[0]);
      }
    });
  }
}
