import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch'; // O p-toggleswitch en v18
import { SliderModule } from 'primeng/slider';
import { ColorPickerModule } from 'primeng/colorpicker';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-lighting',
  imports: [CommonModule, FormsModule, ButtonModule, ToggleSwitchModule, SliderModule, DialogModule, ColorPickerModule],
  templateUrl: './lighting.html',
  styleUrl: './lighting.css',
})
export class Lighting {
  // Luz seleccionada temporalmente para el overlay de color
  selectedLight: any = {};

  // Colores rápidos (Blanco cálido, Frío, RGBs)
  presetColors = ['#ffffff', '#ffaa00', '#ff0000', '#00ff00', '#0000ff'];

  scenes = [
    { name: 'Lectura', icon: 'pi-book', color: '#ffaa00', brightness: 60 },
    { name: 'Cine', icon: 'pi-ticket', color: '#4400ff', brightness: 30 },
    { name: 'Energía', icon: 'pi-bolt', color: '#ffffff', brightness: 100 },
    { name: 'Romántico', icon: 'pi-heart', color: '#ff0044', brightness: 40 },
  ];

  lights = [
    { id: 1, name: 'Lámpara de Pie', room: 'Sala', isOn: true, brightness: 75, color: '#ffaa00' }, // Naranja cálido
    { id: 2, name: 'Techo Principal', room: 'Sala', isOn: false, brightness: 100, color: '#ffffff' },
    { id: 3, name: 'Tira LED TV', room: 'Sala', isOn: true, brightness: 50, color: '#8a2be2' }, // Violeta
    { id: 4, name: 'Velador Izq', room: 'Dormitorio', isOn: true, brightness: 20, color: '#ff4500' }, // Rojo suave
    { id: 5, name: 'Velador Der', room: 'Dormitorio', isOn: false, brightness: 20, color: '#ff4500' },
    { id: 6, name: 'Mesada', room: 'Cocina', isOn: true, brightness: 100, color: '#ffffff' },
  ];

  getActiveCount() {
    return this.lights.filter(l => l.isOn).length;
  }

  turnAllOff() {
    this.lights.forEach(l => l.isOn = false);
  }

  activateScene(scene: any) {
    // Simulación: Aplica la escena a todas las luces activas o de un grupo
    this.lights.forEach(l => {
      l.isOn = true;
      l.color = scene.color;
      l.brightness = scene.brightness;
    });
  }
}
