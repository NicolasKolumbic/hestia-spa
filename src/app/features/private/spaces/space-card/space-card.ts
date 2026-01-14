import { CommonModule } from '@angular/common';
import { Component, inject, input, output, signal } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ZoneDto } from 'src/app/core/domain/dtos/zone.dto';
import { MenuModule } from 'primeng/menu';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { Zone } from 'src/app/core/domain/models/zone';
import { ConfirmDialog } from "primeng/confirmdialog";


@Component({
  selector: 'hta-space-card',
  imports: [CommonModule, MenuModule, TooltipModule, ConfirmDialog],
  templateUrl: './space-card.html',
  styleUrl: './space-card.css',
})
export class SpaceCard {
  space = input.required<Zone>();

  delete = output<Zone>();
  edit = output<Zone>();

  selectedSpace = signal<Zone | null>(null);

  menuItems: MenuItem[] = [
    {
      label: 'Editar',
      icon: 'pi pi-pencil',
      command: () => {
        this.edit.emit(this.selectedSpace()!);
      }
    },
    {
      label: 'Eliminar',
      icon: 'pi pi-trash',
      styleClass: 'text-red-500',
      command: () => this.deleteSpace(this.selectedSpace()!)
    }
  ];

  #confirmationService = inject(ConfirmationService);

  deleteSpace(space: Zone) {
    this.#confirmationService.confirm({
      message: `¿Estás seguro de eliminar "${space.name}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        this.delete.emit(space);
      }
    });
  }
}
