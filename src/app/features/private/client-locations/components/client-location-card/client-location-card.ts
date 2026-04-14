import { Component, input } from '@angular/core';
import { Site } from '@core/index';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'hta-client-location-card',
  imports: [LeafletModule, Tag],
  templateUrl: './client-location-card.html',
  styleUrl: './client-location-card.css',
})
export class ClientLocationCard {
  site = input.required<Site>();
}
