import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'hta-about-us',
  imports: [CommonModule, ButtonModule, CardModule],
  templateUrl: './about-us.html',
  styleUrl: './about-us.css',
})
export class AboutUs {
  team = [
    {
      name: 'Matias Banega',
      role: 'Co-Founder & CEO',
      bio: 'Visionario de la integración tecnológica. Obsesionado con hacer que la tecnología compleja se sienta invisible.',
      image: 'assets/team-matias.jpg', // Placeholder
      linkedin: '#'
    },
    {
      name: 'Alejandro Sartorio',
      role: 'Co-Founder & CTO',
      bio: 'Arquitecto de sistemas. El guardián de la seguridad y el responsable de que Hestia procese todo localmente.',
      image: 'assets/team-alejandro.jpg',
      linkedin: '#'
    },
    {
      name: 'Nicolás Kolumbic',
      role: 'Head of Product',
      bio: 'Estratega de experiencia de usuario. Se asegura de que tu abuela también pueda usar Hestia.',
      image: 'assets/team-nicolas.jpg',
      linkedin: '#'
    }
  ];

  values = [
    {
      icon: 'pi-lock',
      title: 'Privacidad Radical',
      desc: 'Creemos que lo que pasa en tu casa, se queda en tu casa. Sin letra chica.'
    },
    {
      icon: 'pi-bolt',
      title: 'Obsesión por la Calidad',
      desc: 'No lanzamos hardware "beta". Si entra en tu hogar, debe funcionar para siempre.'
    },
    {
      icon: 'pi-users',
      title: 'Diseño Inclusivo',
      desc: 'La domótica no debe ser solo para ingenieros. Hacemos tecnología para humanos.'
    }
  ];
}
