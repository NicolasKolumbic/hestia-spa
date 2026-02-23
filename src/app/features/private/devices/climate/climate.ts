import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KnobModule } from 'primeng/knob';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { DeviceService } from '@core/services/device.service';

@Component({
  selector: 'app-climate',
  standalone: true,
  imports: [CommonModule, FormsModule, KnobModule, ToggleSwitchModule],
  templateUrl: './climate.html',
  styleUrl: './climate.css',
})
export class Climate implements OnInit {
  #deviceService = inject(DeviceService);

  /**
   * Map climateDevices into the zone shape expected by the HTML template.
   * Each thermostat/sensor channel becomes a "zone".
   */
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
