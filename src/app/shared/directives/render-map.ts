import { AfterViewInit, Directive, effect, ElementRef, inject, input } from '@angular/core';
import { map, Marker, marker, icon, Map, tileLayer } from 'leaflet';
import { timer } from 'rxjs';

@Directive({
  selector: '[htaRenderMap]'
})
export class RenderMap implements AfterViewInit {
  lat = input<number>();
  lng = input<number>();
  name = input<string>();

  #el = inject(ElementRef);
  #map?: Map;
  #marker?: Marker;

  constructor() {
    effect(() => {
      this.updateMarker();
    });
  }

  ngAfterViewInit(): void {
    timer(0).subscribe(() => {
      this.#initMap();
    })
  }

  #initMap(): void {
    const defaultIcon = icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });

    // Set the default marker icon
    Marker.prototype.options.icon = defaultIcon;

    // Create map centered at a default location
    this.#map = map(this.#el.nativeElement).setView([-32.85882519646386, -60.85588230108391], 8);

    // Add OpenStreetMap tiles
    tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

  }

  updateMarker(): void {
    if (this.lat() && this.lng()) {
      if (this.#marker) {
        this.#map?.removeLayer(this.#marker);
      }
      this.#marker = marker([this.lat()!, this.lng()!])
        .addTo(this.#map!)
        .bindPopup(`<b>${this.name()}</b>`);
      this.#map!.setView([this.lat()!, this.lng()!], 14);
    }
  }

}
