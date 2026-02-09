import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'hta-technology',
  imports: [CommonModule, ButtonModule, TagModule],
  templateUrl: './technology.html',
  styleUrl: './technology.css',
})
export class Technology {
  activeCategory = 'all';

  categories = [
    { id: 'all', label: 'Todo' },
    { id: 'hub', label: 'Cerebro (Hubs)' },
    { id: 'sensors', label: 'Sensores' },
    { id: 'cameras', label: 'Visión' },
    { id: 'actuators', label: 'Control' }
  ];

  products = [
    {
      id: 1,
      name: 'Hestia Hub Pro',
      category: 'hub',
      tagline: 'El cerebro local.',
      price: '$149',
      image: 'assets/hub-pro.png', // Placeholder
      specs: ['Zigbee 3.0', 'Matter', 'Edge AI', 'Batería Respaldo'],
      isNew: true
    },
    {
      id: 2,
      name: 'Sentinel Cam 4K',
      category: 'cameras',
      tagline: 'Visión nocturna a color.',
      price: '$89',
      image: 'assets/cam-4k.png',
      specs: ['IP67 Exterior', 'Detección Rostros', 'Foco LED'],
      isNew: false
    },
    {
      id: 3,
      name: 'Sensor Puerta/Ventana',
      category: 'sensors',
      tagline: 'Invisible y rápido.',
      price: '$29',
      image: 'assets/sensor-door.png',
      specs: ['2 años batería', 'Tamper Alert', 'Ultra-compacto'],
      isNew: false
    },
    {
      id: 4,
      name: 'Termostato Touch',
      category: 'actuators',
      tagline: 'Clima perfecto.',
      price: '$119',
      image: 'assets/thermostat.png',
      specs: ['Pantalla OLED', 'Sensor Humedad', 'Aprendizaje'],
      isNew: true
    },
    {
      id: 5,
      name: 'Smart Lock V2',
      category: 'actuators',
      tagline: 'Entra sin llaves.',
      price: '$199',
      image: 'assets/lock.png',
      specs: ['Huella', 'PIN', 'Llave física', 'NFC'],
      isNew: false
    },
    {
      id: 6,
      name: 'Sensor de Fugas',
      category: 'sensors',
      tagline: 'Evita desastres.',
      price: '$39',
      image: 'assets/water-sensor.png',
      specs: ['Sirena 80dB', 'Cierre de válvula auto'],
      isNew: false
    }
  ];

  get filteredProducts() {
    return this.activeCategory === 'all'
      ? this.products
      : this.products.filter(p => p.category === this.activeCategory);
  }

  setCategory(cat: string) {
    this.activeCategory = cat;
  }
}
