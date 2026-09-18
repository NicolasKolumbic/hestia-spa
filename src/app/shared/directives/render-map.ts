import { AfterViewInit, Directive, effect, ElementRef, inject, input, output } from '@angular/core';
import { map, Marker, marker, icon, Map, tileLayer, LeafletMouseEvent } from 'leaflet';
import { timer } from 'rxjs';

@Directive({
  selector: '[htaRenderMap]'
})
export class RenderMap implements AfterViewInit {
  lat = input<number | string>();
  lng = input<number | string>();
  name = input<string>();
  readonly = input<boolean>(false);

  locationChange = output<{ lat: number; lng: number }>();

  #el = inject(ElementRef);
  #map?: Map;
  #marker?: Marker;

  constructor() {
    effect(() => {
      this.lat();
      this.lng();
      this.updateMarker();
    });
  }

  ngAfterViewInit(): void {
    timer(100).subscribe(() => {
      this.#initMap();
      this.updateMarker();
    });
  }

  #initMap(): void {
    if (this.#map) return;

    const defaultIcon = icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });

    Marker.prototype.options.icon = defaultIcon;

    const latVal = this.#parseCoord(this.lat());
    const lngVal = this.#parseCoord(this.lng());

    const initialLat = latVal ?? -32.85882519646386;
    const initialLng = lngVal ?? -60.85588230108391;
    const initialZoom = latVal !== null && lngVal !== null ? 14 : 8;

    this.#map = map(this.#el.nativeElement).setView([initialLat, initialLng], initialZoom);

    tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', (e: LeafletMouseEvent) => {
      if (this.readonly()) return;
      const { lat, lng } = e.latlng;
      this.setMarkerPosition(lat, lng, false);
      this.locationChange.emit({ lat, lng });
    });
  }

  updateMarker(): void {
    if (!this.#map) return;
    const latVal = this.#parseCoord(this.lat());
    const lngVal = this.#parseCoord(this.lng());

    if (latVal !== null && lngVal !== null) {
      this.setMarkerPosition(latVal, lngVal, true);
    } else if (this.#marker) {
      this.#map.removeLayer(this.#marker);
      this.#marker = undefined;
    }
  }

  private setMarkerPosition(lat: number, lng: number, recenter: boolean = true): void {
    if (!this.#map) return;

    if (this.#marker) {
      this.#marker.setLatLng([lat, lng]);
    } else {
      this.#marker = marker([lat, lng], {
        draggable: !this.readonly(),
      }).addTo(this.#map);

      this.#marker.on('dragend', () => {
        if (this.readonly()) return;
        const position = this.#marker?.getLatLng();
        if (position) {
          this.locationChange.emit({ lat: position.lat, lng: position.lng });
        }
      });
    }

    if (this.name()) {
      this.#marker.unbindPopup();
      this.#marker.bindPopup(`<b>${this.name()}</b>`).openPopup();
    }

    if (recenter) {
      this.#map.invalidateSize();
      this.#map.flyTo([lat, lng], 15, { duration: 1.2 });
    }
  }

  #parseCoord(value: number | string | undefined | null): number | null {
    if (value === undefined || value === null || value === '') return null;
    const parsed = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(parsed) ? null : parsed;
  }
}
