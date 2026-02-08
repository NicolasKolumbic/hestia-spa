import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';

@Component({
  selector: 'hta-security',
  imports: [CommonModule, ButtonModule, AccordionModule],
  templateUrl: './security.html',
  styleUrl: './security.css',
})
export class Security {
  activeComparison = 'hestia'; // 'traditional' | 'hestia'

  encryptionFeatures = [
    {
      title: 'Encriptación AES-256',
      desc: 'El mismo estándar que usan los bancos. Si alguien roba tu disco duro, solo verá ruido digital.',
      icon: 'pi-lock'
    },
    {
      title: 'Keys en Hardware',
      desc: 'Las llaves de encriptación se guardan en un chip físico (TPM) dentro del Hub, imposible de extraer por software.',
      icon: 'pi-key'
    },
    {
      title: 'Transmisión TLS 1.3',
      desc: 'Tus comandos viajan por un túnel seguro. Nadie en tu red Wi-Fi puede interceptar tus contraseñas.',
      icon: 'pi-shield'
    }
  ];

  faqs = [
    { question: '¿Hestia puede ver mis cámaras?', answer: 'No. Técnicamente imposible. El video se procesa localmente y solo sale encriptado hacia tu dispositivo.' },
    { question: '¿Qué pasa si cortan Internet?', answer: 'Tu seguridad sigue activa. Alarmas y grabaciones funcionan localmente gracias al procesamiento Edge.' },
    { question: '¿Dónde se guardan mis videos?', answer: 'Por defecto en tu Hub local. La nube es opcional y solo para copias de seguridad encriptadas.' }
  ];
}
