import { Component } from '@angular/core';
import { TimelineModule } from 'primeng/timeline';
import { ProgressBarModule } from 'primeng/progressbar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-devices-overview',
  imports: [TimelineModule, ProgressBarModule, CommonModule],
  templateUrl: './devices-overview.html',
  styleUrl: './devices-overview.css',
})
export class DevicesOverview {
  // LOGS
  events = [
    { status: 'Puerta Principal Abierta', date: '18:45', icon: 'pi-unlock', color: '#F06428', description: 'Desbloqueado manualmente por Amy.' },
    { status: 'Movimiento Detectado', date: '18:42', icon: 'pi-eye', color: '#3B82F6', description: 'Cámara Jardín (Clip de 10s)', image: 'assets/motion-thumb.jpg' },
    { status: 'Clima Automático', date: '17:30', icon: 'pi-bolt', color: '#22c55e', description: 'Termostato ajustado a 24°C por rutina.' },
    { status: 'Sistema Armado', date: '08:15', icon: 'pi-shield', color: '#64748b', description: 'Modo "Ausente" activado.' },
  ];

  // BATERÍAS
  batteries = [
    { name: 'Sensor Ventana Cocina', level: 15 }, // Bajo
    { name: 'Cerradura Entrada', level: 85 },
    { name: 'Sensor de Humo', level: 92 },
  ];

  // ALERTAS
  offlineDevices = ['Cámara Garage', 'Luz Patio Trasero'];
}
