import { Component, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';
import { SiteCard, SpaceService } from '@core/index';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import { SiteTypeIconComponent } from "@shared/bussiness/site-type-icon/site-type-icon.component";

@Component({
  selector: 'hta-client-location-card',
  imports: [LeafletModule, SiteTypeIconComponent],
  templateUrl: './client-location-card.html',
  styleUrl: './client-location-card.css',
})
export class ClientLocationCard {
  site = input.required<SiteCard>();

  selectedSite = output<SiteCard>();
  refresh = output<void>();

  #router = inject(Router);
  #siteService = inject(SpaceService);

  editSite(): void {
    this.#router.navigate(['/platform/clients-locations', this.site().siteId]);
  }

  markToSite(site: SiteCard): void {
    this.selectedSite.emit(site);
  }

  active(): void {
    this.#siteService.active(this.site().siteId).subscribe(() => this.refresh.emit());
  }

  inactive(): void {
    this.#siteService.inative(this.site().siteId).subscribe(() => this.refresh.emit());
  }
}
