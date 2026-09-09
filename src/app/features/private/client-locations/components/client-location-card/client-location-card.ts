import { Component, inject, input, output, signal } from '@angular/core';
import { Site, SpaceService } from '@core/index';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import { SiteLocationComponent } from '../site-location/site-location.component';
import { DrawerManagerService } from '@shared/components/drawer/services/drawer-manager.service';
import { SiteDto } from '@core/domain/dtos/site.dto';
import { SiteTypeIconComponent } from "@shared/bussiness/site-type-icon/site-type-icon.component";

@Component({
  selector: 'hta-client-location-card',
  imports: [LeafletModule, SiteTypeIconComponent],
  templateUrl: './client-location-card.html',
  styleUrl: './client-location-card.css',
})
export class ClientLocationCard {
  site = input.required<Site>();

  refresh = output<void>();
  selectedSite = output<Site>();

  #drawerManagerService = inject(DrawerManagerService);
  #spaceService = inject(SpaceService);

  openSiteDrawer(): void {
    const drawerRef = this.#drawerManagerService.open<Site>({
      title: 'Editar sitio',
      component: SiteLocationComponent,
      inputs: { site: this.site() }
    });

    drawerRef.confirmed().subscribe((site: Site) => {
      const siteDto: SiteDto = {
        siteId: site.siteId,
        name: site.name,
        type: site.type,
        status: site.status,
        address: site.address,
        city: site.city,
        countryCode: site.countryCode,
        locale: site.locale,
        province: site.province,
        latitude: site.latitude,
        longitude: site.longitude,
        postalCode: site.postalCode,
      };
      this.#spaceService.update(siteDto).subscribe(() => {
        this.refresh.emit();
      });
    });
  }

  markToSite(site: Site): void {
    this.selectedSite.emit(site);
  }
}
