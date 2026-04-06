import { Component, signal } from '@angular/core';
import { Button } from "@shared/components/button/button";
import { Tag } from "primeng/tag";
import { Tooltip } from 'primeng/tooltip';
import { SectionWrapper } from "@shared/components/section-wrapper/section-wrapper";
import { Card } from "@shared/components/card/card";

export interface Client {
  id: number;
  nombre: string;
  cuit: string;
  activo: boolean;
  totalUsuarios: number;
  totalDispositivos: number;
  fechaAlta: string;
  ownerEmail?: string;
}

@Component({
  selector: 'hta-client-managment',
  imports: [Button, Tag, Tooltip, SectionWrapper, Card],
  templateUrl: './client-managment.html',
  styleUrl: './client-managment.css',
})
export class ClientManagment {
  clients = [
    {
      id: 1,
      nombre: 'Familia Pérez',
      cuit: '20-35442110-9',
      activo: true,
      totalUsuarios: 4,
      totalDispositivos: 12,
      fechaAlta: '2026-01-15',
      ownerEmail: 'nicolas@example.com'
    },
    {
      id: 2,
      nombre: 'Consorcio Edificio Sky',
      cuit: '30-71228845-2',
      activo: true,
      totalUsuarios: 28,
      totalDispositivos: 154,
      fechaAlta: '2026-02-10',
      ownerEmail: 'admin@skyedificio.com'
    },
    {
      id: 3,
      nombre: 'Logística Rosario S.A.',
      cuit: '30-55889932-1',
      activo: false,
      totalUsuarios: 15,
      totalDispositivos: 45,
      fechaAlta: '2026-03-01'
    },
    {
      id: 4,
      nombre: 'Barrio Cerrado Los Álamos',
      cuit: '33-44556677-9',
      activo: true,
      totalUsuarios: 120,
      totalDispositivos: 310,
      fechaAlta: '2025-11-20',
      ownerEmail: 'intendencia@losalamos.com'
    },
    {
      id: 5,
      nombre: 'Hestia Tech Center',
      cuit: '20-11223344-5',
      activo: true,
      totalUsuarios: 8,
      totalDispositivos: 24,
      fechaAlta: '2026-03-20',
      ownerEmail: 'it@hestia.tech'
    },
    {
      id: 6,
      nombre: 'Gimnasio IronBody',
      cuit: '27-99887766-4',
      activo: false,
      totalUsuarios: 2,
      totalDispositivos: 5,
      fechaAlta: '2026-03-25'
    }
  ];
  selectedClient = signal<Client[]>([])

  displayModalOwner: boolean = false;

  // Lógica para cambiar el estado (Activar/Inactivar)
  toggleEstado(cliente: Client) {
    // En una app real, aquí llamarías al servicio
    cliente.activo = !cliente.activo;

    // Ejemplo de feedback visual con Toast (opcional)
    console.log(`Cliente ${cliente.nombre} ahora está ${cliente.activo ? 'Activo' : 'Inactivo'}`);
  }

  // Abrir modal para crear el usuario maestro
  abrirModalOwner(client: Client) {
    this.selectedClient.update((clients) => [...clients, client]);
    this.displayModalOwner = true;
  }

  confirmarCreacionOwner() {
    if (this.selectedClient().length) {
      // Simulamos que guardamos el email en el objeto
      //this.clienteSeleccionado.ownerEmail = 'nuevo-owner@cliente.com';
      this.displayModalOwner = false;
      //console.log('Owner creado con éxito para:', this.clienteSeleccionado.nombre);
    }
  }
}
