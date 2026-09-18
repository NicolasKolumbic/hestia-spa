import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KnobModule } from 'primeng/knob';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { filter, switchMap } from 'rxjs';
import { DeviceService } from '@core/services/device.service';
import { WeatherService } from '@core/services/weather.service';
import { SiteCard, SpaceService } from '@core/index';
import { WeatherTimeStamp } from '../../../../core/domain/models/weather-timestamp';

@Component({
  selector: 'app-climate',
  standalone: true,
  imports: [CommonModule, FormsModule, KnobModule, ToggleSwitchModule],
  templateUrl: './climate.html',
  styleUrl: './climate.css',
})
export class Climate implements OnInit {
  #deviceService = inject(DeviceService);
  #weatherService = inject(WeatherService);
  #spaceService = inject(SpaceService);

  weather = signal<WeatherTimeStamp | null>(null);

  zones = computed(() =>
    this.#deviceService.climateDevices().flatMap(device =>
      device.channels.map(ch => ({
        id: ch.channelId,
        name: device.name,
        isOn: ch.isOn,
        mode: (ch.payload['mode'] as string) ?? 'cool',
        currentTemp: (ch.payload['currentTemp'] as number) ?? 0,
        targetTemp: (ch.payload['targetTemp'] as number) ?? 22,
        humidity: (ch.payload['humidity'] as number) ?? 0,
      }))
    )
  );

  ngOnInit() {
    this.#deviceService.getAllDevices().subscribe();

    this.#spaceService.selectedSite$
      .pipe(
        filter((site): site is SiteCard => !!site && site.latitude !== undefined && site.longitude !== undefined),
        switchMap(site => this.#weatherService.watchWeather(site.latitude, site.longitude))
      )
      .subscribe((weather: WeatherTimeStamp) => {
        this.weather.set(weather);
      });
  }

  getKnobColor(zone: { mode: string; isOn: boolean }): string {
    if (!zone.isOn) return '#64748b';
    switch (zone.mode) {
      case 'heat': return '#F06428';
      case 'cool': return '#3B82F6';
      case 'fan': return '#22c55e';
      default: return '#F06428';
    }
  }
}
