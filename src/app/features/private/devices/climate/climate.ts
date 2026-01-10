import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KnobModule } from 'primeng/knob';
import { ToggleSwitchModule } from 'primeng/toggleswitch'

@Component({
  selector: 'app-climate',
  standalone: true,
  imports: [CommonModule, FormsModule, KnobModule, ToggleSwitchModule],
  templateUrl: './climate.html',
  styleUrl: './climate.css',
})
export class Climate {
  zones = [
    { id: 1, name: 'Living', currentTemp: 23, targetTemp: 24, humidity: 45, isOn: true, mode: 'heat' }, // Calefacción
    { id: 2, name: 'Dormitorio Principal', currentTemp: 26, targetTemp: 21, humidity: 50, isOn: true, mode: 'cool' }, // Aire Acondicionado
    { id: 3, name: 'Oficina', currentTemp: 22, targetTemp: 22, humidity: 40, isOn: false, mode: 'cool' }, // Apagado
    { id: 4, name: 'Cuarto de Invitados', currentTemp: 20, targetTemp: 24, humidity: 55, isOn: true, mode: 'fan' } // Ventilación
  ];

  // Función para determinar el color del arco del termostato dinámicamente
  getKnobColor(zone: any): string {
    if (!zone.isOn) return '#64748b'; // Slate-500 (Apagado)

    switch (zone.mode) {
      case 'heat': return '#F06428'; // Naranja Hestia
      case 'cool': return '#3B82F6'; // Azul
      case 'fan': return '#22c55e';  // Verde
      default: return '#F06428';
    }
  }
}
