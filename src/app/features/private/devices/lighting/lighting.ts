import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeviceService } from '@core/services/device.service';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ColorPickerModule } from 'primeng/colorpicker';
import { Dialog } from "@shared/components/dialog/dialog";
import { LightsForm } from "./components/lights-form/lights-form";
import { Device } from '@core/domain/models/device';
import { DeviceGrid } from '@shared/components/device-grid/device-grid';
import { DeviceChannelControl } from '@shared/components/device-channel-control/device-channel-control';
import { DeviceChannel } from '@core/domain/models/device-channel';

@Component({
  selector: 'app-lighting',
  imports: [CommonModule, FormsModule, ButtonModule, DialogModule, ColorPickerModule, Dialog, LightsForm, DeviceGrid, DeviceChannelControl],
  templateUrl: './lighting.html',
  styleUrl: './lighting.css',
})
export class Lighting {
  #deviceService = inject(DeviceService);

  // Use the category-filtered computed signal
  devices = this.#deviceService.lightingDevices;
  showDialog = signal(false);
  isEditMode = signal(false);
  selectedDevice = signal<Device | null>(null);

  title = computed<string>(() => {
    return this.isEditMode() ? 'Editar Dispositivo' : 'Agregar Dispositivo';
  });

  constructor() {
    this.#deviceService.getAllDevices().subscribe({
      error: (err) => console.error('Error al inicializar dispositivos de iluminación:', err),
    });
  }

  displayColorPicker = false;
  displayAddDeviceDialog = false;

  selectedLight: DeviceChannel | null = null;
  selectedLightColor = '#ffffff';

  // Colores rápidos (Blanco cálido, Frío, RGBs)
  presetColors = ['#ffffff', '#ffaa00', '#ff0000', '#00ff00', '#0000ff'];

  scenes = [
    { name: 'Lectura', icon: 'pi-book', color: '#ffaa00', brightness: 60 },
    { name: 'Cine', icon: 'pi-ticket', color: '#4400ff', brightness: 30 },
    { name: 'Energía', icon: 'pi-bolt', color: '#ffffff', brightness: 100 },
    { name: 'Romántico', icon: 'pi-heart', color: '#ff0044', brightness: 40 },
  ];

  addHandler(): void {
    this.showDialog.set(true);
  }

  cancelHandler(): void {
    this.showDialog.set(false);
    this.isEditMode.set(false);
    this.selectedDevice.set(null);
  }

  confirmHandler(device: Device): void {
    this.showDialog.set(true);
    this.saveNewDevice(device);
  }

  saveNewDevice(device: Device): void {
    this.#deviceService.createDevice(device).subscribe(() => {
      this.displayAddDeviceDialog = false;
      this.#deviceService.getAllDevices().subscribe();
    });
  }

  turnAllOff() {
    this.devices().forEach(device => {
      device.channels.forEach(ch => {
        if (ch.isOn && !ch.isPending) {
          this.toggleLight(ch);
        }
      });
    });
  }

  activateScene(scene: any) {
    this.devices().forEach(device => {
      const ch = device.channels[0];
      if (ch && !ch.isPending) {
        this.#deviceService.updateChannelState(ch.channelId, {
          isOn: true,
          payload: { ...ch.payload, brightness: scene.brightness, color: scene.color }
        }).subscribe({
          error: (err) => console.error(`Error al activar escena en canal ${ch.channelId}:`, err)
        });
      }
    });
  }

  toggleLight(channel: DeviceChannel) {
    if (channel.isPending) {
      console.warn(`Operación en curso para canal ${channel.channelId}, comando bloqueado.`);
      return;
    }
    this.#deviceService.updateChannelState(channel.channelId, { isOn: !channel.isOn }).subscribe({
      error: (err) => console.error(`Error al alternar canal ${channel.channelId}:`, err)
    });
  }

  updateBrightness(channel: DeviceChannel, value?: number) {
    if (channel.isPending) return;
    this.#deviceService.updateChannelState(channel.channelId, { payload: { ...channel.payload, brightness: value } }).subscribe({
      error: (err) => console.error(`Error al actualizar brillo en canal ${channel.channelId}:`, err)
    });
  }

  updateColor(channel: DeviceChannel, color: string) {
    if (channel.isPending) return;
    this.#deviceService.updateChannelState(channel.channelId, { payload: { ...channel.payload, color } }).subscribe({
      next: () => {
        if (this.selectedLight) {
          this.selectedLight.payload = { ...this.selectedLight.payload, color };
        }
      },
      error: (err) => console.error(`Error al actualizar color en canal ${channel.channelId}:`, err)
    });
  }

  openColorPicker(channel: DeviceChannel) {
    this.selectedLight = channel;
    this.selectedLightColor = channel.color;
    this.displayColorPicker = true;
  }
}
