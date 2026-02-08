import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AccordionModule } from 'primeng/accordion';

@Component({
  selector: 'hta-careers',
  imports: [CommonModule, ButtonModule, TagModule, AccordionModule],
  templateUrl: './careers.html',
  styleUrl: './careers.css',
})
export class Careers {
  perks = [
    { icon: 'pi-wrench', title: 'Lab de Hardware', desc: 'Acceso ilimitado a impresoras 3D, CNC y componentes para tus proyectos personales.' },
    { icon: 'pi-clock', title: 'Horario Flexible', desc: 'Nos importan los resultados (y que el código compile), no las horas silla.' },
    { icon: 'pi-book', title: 'Aprendizaje Continuo', desc: 'Presupuesto mensual para cursos, libros y conferencias tech.' },
    { icon: 'pi-globe', title: 'Híbrido / Remoto', desc: 'Oficina en Rosario para tocar hardware, casa para concentrarte en software.' }
  ];

  jobs = [
    {
      department: 'Ingeniería de Software',
      positions: [
        { title: 'Rust Developer (Embedded)', type: 'Full-time', loc: 'Híbrido', tags: ['Senior', 'Rust', 'C++'] },
        { title: 'Frontend Developer (Angular)', type: 'Full-time', loc: 'Remoto', tags: ['Mid-Level', 'UX/UI'] }
      ]
    },
    {
      department: 'Hardware & I+D',
      positions: [
        { title: 'Ingeniero Electrónico (PCB Design)', type: 'Full-time', loc: 'Presencial (Rosario)', tags: ['KiCad', 'Altium'] }
      ]
    }
  ];

  techStack = [
    'assets/logo-rust.svg', 'assets/logo-angular.svg', 'assets/logo-python.svg', 'assets/logo-matter.svg'
  ];
}
