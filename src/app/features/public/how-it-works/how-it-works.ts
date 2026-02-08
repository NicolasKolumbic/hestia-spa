import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'hta-how-it-works',
  imports: [CommonModule, ButtonModule],
  templateUrl: './how-it-works.html',
  styleUrl: './how-it-works.css',
})
export class HowItWorks {
  activeStep = 0;
  intervalId: any;

  steps = [
    {
      id: 0,
      title: '1. Enchufa y Conecta',
      desc: 'Sin cables complejos. Solo conecta tu Hestia Hub a la corriente y a tu red Wi-Fi. Nuestros dispositivos usan tecnología Plug & Play.',
      icon: 'pi-bolt',
      screenTitle: 'Buscando...',
      screenIcon: 'pi-spin pi-spinner',
      screenStatus: 'Escaneando red local'
    },
    {
      id: 1,
      title: '2. Detección Automática',
      desc: 'La app reconocerá instantáneamente tus luces, cerraduras y sensores cercanos. Solo dales un nombre y asígnales una habitación.',
      icon: 'pi-wifi',
      screenTitle: '¡Dispositivo Hallado!',
      screenIcon: 'pi-check-circle',
      screenStatus: 'Luz Living • Agregada'
    },
    {
      id: 2,
      title: '3. Crea tu Magia',
      desc: 'Configura reglas simples como "Si me voy, apaga todo". Hestia aprende de tus hábitos para sugerirte ahorros.',
      icon: 'pi-sparkles',
      screenTitle: 'Rutina Activa',
      screenIcon: 'pi-sun',
      screenStatus: 'Modo "Buenos Días"'
    }
  ];

  ngOnInit() {
    // Rotación automática de pasos para demostración
    this.startAutoPlay();
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  startAutoPlay() {
    this.intervalId = setInterval(() => {
      this.activeStep = (this.activeStep + 1) % this.steps.length;
    }, 4000); // Cambia cada 4 segundos
  }

  manualSelect(index: number) {
    clearInterval(this.intervalId); // Detiene el autoplay si el usuario interactúa
    this.activeStep = index;
  }
}
