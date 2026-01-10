import { Component } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-automation',
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule, ToggleSwitchModule, TooltipModule, InputTextModule],
  templateUrl: './automation.html',
  styleUrl: './automation.css',
})
export class Automation {
  showCreator = false;
  activeFilter = 'all';

  filters = [
    { label: 'Todos', value: 'all' },
    { label: 'Tiempo', value: 'time' },
    { label: 'Seguridad', value: 'security' },
    { label: 'Ambiente', value: 'ambiance' }
  ];

  routines = [
    {
      id: 1,
      name: 'Despertar Suave',
      type: 'time',
      active: true,
      triggerIcon: 'pi-clock',
      triggerText: 'Todos los días 07:00 AM',
      actionIcon: 'pi-sun',
      actionText: 'Luces al 20%, Abrir persianas',
      lastRun: 'Hoy, 07:00 AM'
    },
    {
      id: 2,
      name: 'Salir de Casa',
      type: 'security',
      active: true,
      triggerIcon: 'pi-map-marker',
      triggerText: 'Al alejarme 100m',
      actionIcon: 'pi-lock',
      actionText: 'Apagar todo, Cerrar puertas',
      lastRun: 'Ayer, 08:30 AM'
    },
    {
      id: 3,
      name: 'Modo Cine',
      type: 'ambiance',
      active: false,
      triggerIcon: 'pi-play',
      triggerText: 'Al activar TV',
      actionIcon: 'pi-moon',
      actionText: 'Luces violetas, Bajar persianas',
      lastRun: 'Hace 3 días'
    },
    {
      id: 4,
      name: 'Alerta Intruso',
      type: 'security',
      active: true,
      triggerIcon: 'pi-eye',
      triggerText: 'Movimiento en Jardín (Noche)',
      actionIcon: 'pi-bell',
      actionText: 'Encender Focos, Notificar',
      lastRun: 'Sin actividad reciente'
    }
  ];

  openCreator() {
    this.showCreator = true;
  }
}
