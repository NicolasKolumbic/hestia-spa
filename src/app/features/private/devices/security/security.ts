import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-security',
  imports: [CommonModule, SelectButtonModule, TooltipModule, FormsModule, DatePipe],
  templateUrl: './security.html',
  styleUrl: './security.css',
})
export class Security {
  now = new Date();

  // Actualiza el reloj cada segundo para efecto "En Vivo"
  constructor() {
    setInterval(() => this.now = new Date(), 1000);
  }

  viewOptions = [
    { name: 'Grid', value: 'grid' },
    { name: 'Lista', value: 'list' }
  ];
  selectedView = { name: 'Grid', value: 'grid' };

  cameras = [
    {
      id: 1,
      name: 'Entrada Principal',
      location: 'Exterior',
      status: 'online',
      isRecording: true,
      streamUrl: 'assets/cam-front-door.jpg' // Usa una imagen placeholder oscura
    },
    {
      id: 2,
      name: 'Jardín Trasero',
      location: 'Exterior',
      status: 'online',
      isRecording: false,
      streamUrl: 'assets/cam-garden.jpg'
    },
    {
      id: 3,
      name: 'Sala de Estar',
      location: 'Interior - Planta Baja',
      status: 'online',
      isRecording: true,
      streamUrl: 'assets/cam-living.jpg'
    },
    {
      id: 4,
      name: 'Garage',
      location: 'Exterior',
      status: 'offline', // Para probar el estado offline
      isRecording: false,
      streamUrl: ''
    }
  ];
}
