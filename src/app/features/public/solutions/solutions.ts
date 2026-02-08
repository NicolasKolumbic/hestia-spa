import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Tabs } from 'primeng/tabs';
import { AccordionModule } from 'primeng/accordion';

@Component({
  selector: 'app-solutions',
  imports: [CommonModule, ButtonModule, AccordionModule],
  templateUrl: './solutions.html',
  styleUrl: './solutions.css',
})
export class Solutions {
  activePillar = 'security';

  pillars = [
    {
      id: 'security',
      label: 'Protección Integral',
      icon: 'pi-shield',
      title: 'Tu hogar, un búnker digital.',
      description: 'Más que cámaras. Hestia integra sensores, cerraduras y alarmas en un ecosistema que distingue entre el cartero y una amenaza real.',
      features: [
        'Detección de rostros con IA local',
        'Simulación de presencia (luces aleatorias)',
        'Cierre automático de perímetros (Geo-cerca)',
        'Notificaciones críticas inmediatas'
      ],
      image: 'assets/solution-security.jpg', // Placeholder
      color: 'text-red-500',
      bgColor: 'bg-red-500/10'
    },
    {
      id: 'energy',
      label: 'Gestión Energética',
      icon: 'pi-bolt',
      title: 'El fin de las facturas sorpresa.',
      description: 'Toma el control de tu consumo. Identifica vampiros energéticos y automatiza el apagado de dispositivos cuando no hay nadie.',
      features: [
        'Monitoreo de consumo en tiempo real',
        'Optimización de carga solar',
        'Apagado inteligente por ausencia',
        'Reportes de huella de carbono'
      ],
      image: 'assets/solution-energy.jpg',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      id: 'comfort',
      label: 'Confort & Ambiente',
      icon: 'pi-sparkles',
      title: 'La atmósfera perfecta, siempre.',
      description: 'La iluminación y climatización se adaptan a tu ritmo circadiano. Despierta con luz suave y duerme con la temperatura ideal.',
      features: [
        'Escenas inmersivas ("Cine", "Lectura")',
        'Climatización por zonas',
        'Control por voz natural',
        'Persianas automatizadas por luz solar'
      ],
      image: 'assets/solution-comfort.jpg',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    }
  ];
}
