import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';

// Imports de PrimeNG
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MenuModule } from 'primeng/menu';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-spaces-list',
  imports: [CommonModule, FormsModule, DialogModule, InputTextModule,
    ButtonModule, ConfirmDialogModule, ToastModule, MenuModule, SelectModule, TooltipModule],
  templateUrl: './spaces-list.html',
  providers: [MessageService, ConfirmationService],
  styleUrl: './spaces-list.css',
})
export class SpacesList {
  // DATOS MOCK
  spaces = [
    { id: 1, name: 'Sala', icon: 'pi-desktop', type: 'living', deviceCount: 5, temp: 24, lightsOn: 2 },
    // ... más espacios
  ];

  // ESTADO DEL MODAL
  spaceDialogVisible = false;
  isEditMode = false;
  selectedSpace: any = null;

  // FORMULARIO
  spaceForm = { id: 0, name: '', icon: '', type: '' };

  // DATOS AUXILIARES
  availableIcons = [
    'pi-home', 'pi-desktop', 'pi-wifi', 'pi-inbox',
    'pi-briefcase', 'pi-building', 'pi-car', 'pi-shopping-cart',
    'pi-heart', 'pi-star' // Agrega iconos relevantes de PrimeIcons
  ];

  spaceTypes = [
    { label: 'Sala de Estar', value: 'living' },
    { label: 'Dormitorio', value: 'bedroom' },
    { label: 'Cocina', value: 'kitchen' },
    { label: 'Baño', value: 'bathroom' },
    { label: 'Oficina', value: 'office' },
    { label: 'Exterior', value: 'outdoor' }
  ];

  // MENÚ CONTEXTUAL (Se regenera dinámicamente o usa la selección actual)
  menuItems: MenuItem[] = [
    {
      label: 'Editar',
      icon: 'pi pi-pencil',
      command: () => this.openEditDialog(this.selectedSpace)
    },
    {
      label: 'Eliminar',
      icon: 'pi pi-trash',
      styleClass: 'text-red-500',
      command: () => this.deleteSpace(this.selectedSpace)
    }
  ];

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) { }

  // 1. ABRIR MODAL CREAR (Vinculado al tile "Agregar")
  openNewSpaceDialog() {
    this.isEditMode = false;
    this.spaceForm = { id: 0, name: '', icon: this.availableIcons[0], type: 'living' };
    this.spaceDialogVisible = true;
  }

  // 2. ABRIR MODAL EDITAR
  openEditDialog(space: any) {
    this.isEditMode = true;
    this.spaceForm = { ...space }; // Copia para no mutar directo
    this.spaceDialogVisible = true;
  }

  // 3. GUARDAR (Create / Update)
  saveSpace() {
    if (this.isEditMode) {
      // Update
      const index = this.spaces.findIndex(s => s.id === this.spaceForm.id);
      if (index !== -1) {
        // Mantenemos los datos que no se editan (temp, devices, etc)
        this.spaces[index] = { ...this.spaces[index], ...this.spaceForm };
        this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: `Espacio "${this.spaceForm.name}" modificado` });
      }
    } else {
      // Create
      const newId = Math.max(...this.spaces.map(s => s.id)) + 1;
      const newSpace = {
        ...this.spaceForm,
        id: newId,
        deviceCount: 0, // Default
        temp: 22,       // Default
        lightsOn: 0
      };
      this.spaces.push(newSpace);
      this.messageService.add({ severity: 'success', summary: 'Creado', detail: 'Nuevo espacio añadido' });
    }
    this.spaceDialogVisible = false;
  }

  // 4. ELIMINAR
  deleteSpace(space: any) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar "${space.name}"? Se desvincularán sus dispositivos.`,
      header: 'Acción Destructiva',
      icon: 'pi pi-info-circle',
      accept: () => {
        this.spaces = this.spaces.filter(s => s.id !== space.id);
        this.messageService.add({ severity: 'info', summary: 'Eliminado', detail: 'El espacio ha sido removido' });
      }
    });
  }
}
