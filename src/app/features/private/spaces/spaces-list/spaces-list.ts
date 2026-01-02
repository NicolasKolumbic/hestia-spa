import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-spaces-list',
  imports: [CommonModule, ButtonModule, InputTextModule, TooltipModule],
  templateUrl: './spaces-list.html',
  styleUrl: './spaces-list.css',
})
export class SpacesList {
  spaces = [
    {
      id: 1,
      name: 'Sala de Estar',
      icon: 'pi-desktop', // Icono de TV/Monitor
      deviceCount: 8,
      temp: 24,
      lightsOn: 3,
      image: 'assets/living-room.jpg'
    },
    {
      id: 2,
      name: 'Dormitorio Principal',
      icon: 'pi-moon',
      deviceCount: 5,
      temp: 21,
      lightsOn: 0, // Todo apagado
      image: 'assets/bedroom.jpg'
    },
    {
      id: 3,
      name: 'Cocina',
      icon: 'pi-box', // O pi-inbox
      deviceCount: 12,
      temp: 26,
      lightsOn: 4,
      image: 'assets/kitchen.jpg'
    },
    {
      id: 4,
      name: 'Oficina',
      icon: 'pi-briefcase',
      deviceCount: 4,
      temp: 22,
      lightsOn: 1,
      image: 'assets/office.jpg'
    }
  ];
}
