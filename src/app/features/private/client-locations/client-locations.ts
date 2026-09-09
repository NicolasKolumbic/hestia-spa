import { Component, inject, OnInit, signal } from '@angular/core';
import { SectionWrapper } from "@shared/components/section-wrapper/section-wrapper";
import { ClientLocationCard } from "./components/client-location-card/client-location-card";
import { Site, SpaceService } from '@core/index';
import { RenderMap } from '@shared/directives/render-map';
import { Button } from '@shared/components/button/button';
import { DrawerManagerService } from '@shared/components/drawer/services/drawer-manager.service';
import { SiteLocationComponent } from './components/site-location/site-location.component';
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
  #drawerManagerService = inject(DrawerManagerService);

  sites = signal<Site[]>([]);
  selectedSite = signal<Site | null>(null);

  ngOnInit(): void {
    this.#spaceService.getAll().subscribe((response) => {
      this.sites.set(response.items);
    });
  }

  newSite(): void {
    this.#drawerManagerService.open({
      title: 'Nuevo sitio',
      component: SiteLocationComponent
    });
  }

  selectSite(site: Site): void {
    this.selectedSite.set(site);
  }
}
