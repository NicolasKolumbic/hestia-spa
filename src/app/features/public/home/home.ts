import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { RouterLink } from '@angular/router';
import { HestiaBrand } from "@shared/components/hestia-brand/hestia-brand";

@Component({
  selector: 'app-home',
  imports: [CommonModule, ButtonModule, RippleModule, RouterLink, HestiaBrand],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  features = [
    {
      icon: 'pi-shield',
      title: 'Seguridad Blindada',
      desc: 'Monitoreo 24/7 con IA que distingue entre mascotas y amenazas reales.'
    },
    {
      icon: 'pi-bolt',
      title: 'Eficiencia Energética',
      desc: 'Optimiza tu consumo eléctrico y reduce facturas hasta un 30% automáticamente.'
    },
    {
      icon: 'pi-mobile',
      title: 'Control Total',
      desc: 'Gestiona luces, clima y accesos desde cualquier lugar del mundo.'
    },
    {
      icon: 'pi-sparkles',
      title: 'Rutinas Inteligentes',
      desc: 'Tu casa se anticipa a ti. "Modo Cine", "Buenos días" y más.'
    }
  ];

  plans = [
    {
      name: 'Starter',
      price: '0',
      period: '/mes',
      desc: 'Ideal para departamentos pequeños.',
      features: ['Hasta 5 dispositivos', '1 Usuario', 'Soporte Básico', 'App Móvil'],
      buttonLabel: 'Comenzar Gratis',
      highlight: false
    },
    {
      name: 'Pro',
      price: '29',
      period: '/mes',
      desc: 'Para hogares conectados.',
      features: ['Dispositivos Ilimitados', '5 Usuarios', 'Grabación en Nube (7 días)', 'Automatización Avanzada'],
      buttonLabel: 'Elegir Pro',
      highlight: true // Este es el plan destacado
    },
    {
      name: 'Enterprise',
      price: 'Consultar',
      period: '',
      desc: 'Para grandes instalaciones.',
      features: ['Gestión Multi-sitio', 'API Access', 'Soporte 24/7 Dedicado', 'Hardware incluido'],
      buttonLabel: 'Contactar Ventas',
      highlight: false
    }
  ];
}
