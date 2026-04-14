import { Component, inject, OnInit, signal } from '@angular/core';
import { Button } from "primeng/button";
import { SectionWrapper } from "@shared/components/section-wrapper/section-wrapper";
import { CardsGrid } from "@shared/components/cards-grid/cards-grid";
import { ClientLocationCard } from "./components/client-location-card/client-location-card";
import { Site, SpaceService } from '@core/index';
import { RenderMap } from '@shared/directives/render-map';


@Component({
  selector: 'hta-client-locations',
  imports: [Button, SectionWrapper, RenderMap, CardsGrid, ClientLocationCard],
  templateUrl: './client-locations.html',
  styleUrl: './client-locations.css',
})
export class ClientLocations implements OnInit {
  #spaceService = inject(SpaceService);

  sites = signal<Site[]>([]);
  selectedSite = signal<Site | null>(null);

  ngOnInit(): void {
    this.#spaceService.getAll().subscribe((response) => {
      this.sites.set(response.items);
    });
  }
}
