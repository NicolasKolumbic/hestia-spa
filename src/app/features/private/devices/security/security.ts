import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-security',
  imports: [
    CommonModule, FormsModule, DialogModule, MenuModule,
    SelectModule, ConfirmDialogModule, ToastModule, ButtonModule, InputTextModule
  ],
  providers: [ConfirmationService, MessageService], // Servicios para Dialogs
  templateUrl: './security.html',
  styleUrl: './security.css',
})
export class Security {
  // Estado de Cámaras
  cameras = [
    { id: 1, name: 'Entrada', location: 'Exterior', status: 'online', streamUrl: '' },
    // ... más cámaras
  ];

  // Variables para el Modal
  cameraDialogVisible = false;
  isEditMode = false;
  selectedCamera: any = null;

  // Modelo del Formulario
  cameraForm = { id: 0, name: '', location: '', streamUrl: '' };

  // Opciones del Dropdown de Ubicación
  locations = ['Exterior', 'Sala', 'Cocina', 'Garage', 'Dormitorio'];

  // Acciones del Menú (3 puntos)
  cameraActions: MenuItem[] = [
    {
      label: 'Editar Configuración',
      icon: 'pi pi-cog',
      command: () => this.openEditCameraDialog(this.selectedCamera)
    },
    {
      separator: true
    },
    {
      label: 'Eliminar Cámara',
      icon: 'pi pi-trash',
      styleClass: 'text-red-500', // Color rojo para acción destructiva
      command: () => this.deleteCamera(this.selectedCamera)
    }
  ];

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) { }

  // 1. ABRIR MODAL PARA CREAR
  openNewCameraDialog() {
    this.isEditMode = false;
    this.cameraForm = { id: 0, name: '', location: '', streamUrl: '' }; // Limpiar form
    this.cameraDialogVisible = true;
  }

  // 2. ABRIR MODAL PARA EDITAR
  openEditCameraDialog(camera: any) {
    this.isEditMode = true;
    this.cameraForm = { ...camera }; // Clonar datos para no editar en vivo
    this.cameraDialogVisible = true;
  }

  // 3. GUARDAR (CREATE / UPDATE)
  saveCamera() {
    if (this.isEditMode) {
      // Lógica de Actualizar (Update en Array)
      const index = this.cameras.findIndex(c => c.id === this.cameraForm.id);
      this.cameras[index] = { ...this.cameraForm, status: 'offline' }; // Status reset
      this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Configuración guardada' });
    } else {
      // Lógica de Crear (Push a Array)
      const newId = this.cameras.length + 1;
      this.cameras.push({ ...this.cameraForm, id: newId, status: 'offline' });
      this.messageService.add({ severity: 'success', summary: 'Creado', detail: 'Cámara vinculada exitosamente' });
    }
    this.cameraDialogVisible = false;
  }

  // 4. ELIMINAR
  deleteCamera(camera: any) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar la cámara "${camera.name}"?`,
      accept: () => {
        this.cameras = this.cameras.filter(c => c.id !== camera.id);
        this.messageService.add({ severity: 'info', summary: 'Eliminado', detail: 'Cámara desvinculada' });
      }
    });
  }
}
