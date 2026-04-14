import { AfterViewInit, Directive, ElementRef, inject, input } from '@angular/core';
import { map, Marker, marker, icon, Map, tileLayer } from 'leaflet';
import { timer } from 'rxjs';

@Directive({
  selector: '[htaRenderMap]'
})
export class RenderMap implements AfterViewInit {
  lat = input<number>();
  lng = input<number>();

  #el = inject(ElementRef);
  #map?: Map;

  // List of locations
  locations = [
    { id: 1, name: 'Thiruvananthapuram', latitude: 8.5241, longitude: 76.9366 },
    { id: 2, name: 'Kochi', latitude: 9.9312, longitude: 76.2673 },
    { id: 3, name: 'Kozhikode', latitude: 11.2588, longitude: 75.7804 },
    { id: 4, name: 'Thrissur', latitude: 10.5276, longitude: 76.2144 },
    { id: 5, name: 'Alappuzha', latitude: 9.4981, longitude: 76.3388 },
    { id: 6, name: 'Kollam', latitude: 8.8932, longitude: 76.6141 }
  ];

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
    this.#map = map(this.#el.nativeElement).setView([this.locations[3].latitude, this.locations[3].longitude], 7);

    // Add OpenStreetMap tiles
    tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Add markers for each location
    this.locations.forEach((location) => {
      marker([location.latitude, location.longitude])
        .addTo(this.#map!)
        .bindPopup(`<b>${location.name}</b>`);
    });
  }

}
