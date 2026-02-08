import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'hta-features',
  imports: [CommonModule, ButtonModule, TagModule],
  templateUrl: './features.html',
  styleUrl: './features.css',
})
export class Features {
  // Definición del Bento Grid
  features = [
    {
      title: 'Cerebro Local (Edge AI)',
      desc: 'Tus rutinas se procesan en el Hub, no en la nube. Si se corta Internet, tu casa sigue funcionando.',
      icon: 'pi-microchip',
      cols: 'md:col-span-2', // Tarjeta Ancha
      rows: 'md:row-span-2', // Tarjeta Alta
      bg: 'bg-gradient-to-br from-slate-900 to-slate-800',
      text: 'text-white',
      image: 'assets/chip-ai.png' // Placeholder visual
    },
    {
      title: 'Privacidad Blindada',
      desc: 'Encriptación AES-256 de extremo a extremo. Tus videos son solo tuyos.',
      icon: 'pi-lock',
      cols: 'md:col-span-1',
      rows: 'md:row-span-1',
      bg: 'bg-white dark:bg-slate-800',
      text: 'text-slate-900 dark:text-white'
    },
    {
      title: 'Control por Voz',
      desc: 'Nativo para Alexa, Google Assistant y Siri Shortcuts.',
      icon: 'pi-microphone',
      cols: 'md:col-span-1',
      rows: 'md:row-span-1',
      bg: 'bg-orange-500',
      text: 'text-white'
    },
    {
      title: 'Multi-Usuario Granular',
      desc: 'Asigna permisos específicos: "Jardinero" (Solo portón, Lun-Vie) o "Niños" (Sin acceso a configuraciones).',
      icon: 'pi-users',
      cols: 'md:col-span-2', // Tarjeta Ancha
      rows: 'md:row-span-1',
      bg: 'bg-slate-100 dark:bg-white/5',
      text: 'text-slate-900 dark:text-white'
    },
    {
      title: 'Protocolo Matter',
      desc: 'Preparado para el futuro. Compatible con miles de dispositivos IoT de otras marcas.',
      icon: 'pi-globe',
      cols: 'md:col-span-1',
      rows: 'md:row-span-1',
      bg: 'bg-blue-600',
      text: 'text-white'
    },
    {
      title: 'Dashboard Personalizable',
      desc: 'Arrastra y suelta widgets. Diseña tu propio centro de control.',
      icon: 'pi-th-large',
      cols: 'md:col-span-1',
      rows: 'md:row-span-1',
      bg: 'bg-white dark:bg-slate-800',
      text: 'text-slate-900 dark:text-white'
    }
  ];

  specs = [
    { label: 'Conectividad', value: 'Wi-Fi 6, Zigbee 3.0, Bluetooth 5.2' },
    { label: 'Compatibilidad', value: 'iOS 15+, Android 10+' },
    { label: 'Alimentación', value: 'USB-C (Hub), Batería CR2032 (Sensores)' },
    { label: 'Garantía', value: '2 Años Internacional' }
  ];
}
