import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeviceService } from '@core/services/device.service';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch'; // O p-toggleswitch en v18
import { SliderModule } from 'primeng/slider';
import { ColorPickerModule } from 'primeng/colorpicker';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Dialog } from "@shared/components/dialog/dialog";
import { LightsForm } from "./components/lights-form/lights-form";
import { Device } from '@core/domain/models/device';
import { DeviceGrid } from '@shared/components/device-grid/device-grid';

@Component({
  selector: 'app-lighting',
  imports: [CommonModule, FormsModule, ButtonModule, ToggleSwitchModule, SliderModule, DialogModule, ColorPickerModule, InputTextModule, Dialog, LightsForm, DeviceGrid],
  templateUrl: './lighting.html',
  styleUrl: './lighting.css',
})
export class Lighting {
  #deviceService = inject(DeviceService);

  // Expose devices signal from service
  devices = this.#deviceService.devices;
  showDialog = signal(false);
  isEditMode = signal(false);
  selectedDevice = signal<Device | null>(null);

  title = computed<string>(() => {
    return this.isEditMode() ? 'Editar Dispositivo' : 'Agregar Dispositivo';
  })


  // Computed property or method to flatten channels for the view if needed, 
  // or update the view to iterate over devices -> channels.
  // For now, let's flatten it to match the existing 'lights' structure for easier migration, 
  // or better, update the template to support the new structure.
  // Given the existing template likely expects a flat list, let's create a computed signal or just use the service's signal directly if template changes.
  // Let's assume we want to adapt the view to the new model.

  // Actually, the previous 'lights' array had: { id, name, room, isOn, brightness, color }
  // Our new structure is Device -> Channels. 
  // A device usually is in a room (Zone). The current Device model in frontend doesn't have Zone yet (it was optional in backend).
  // Let's update the template to iterate devices and their channels.

  // For this step, I will expose the service and methods.

  constructor() {
    this.#deviceService.getAllDevices().subscribe(() => {
      console.log(this.#deviceService.devices);
    });
  }

  displayColorPicker = false;
  displayAddDeviceDialog = false;

  selectedLight: any = {};

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

  /*getActiveCount() {
    return this.devices().filter(l => l.channels.some(c => c.isOn)).length;
  }*/

  turnAllOff() {
    this.devices().forEach(l => {
      if (l.channels.some(c => c.isOn)) this.toggleLight(l);
    });
  }

  activateScene(scene: any) {
    this.devices().forEach(l => {
      this.#deviceService.updateChannelState(l.channels[0].channelId, {
        isOn: true,
        brightness: scene.brightness,
        color: scene.color
      }).subscribe();
    });
  }

  toggleLight(light: any) {
    this.#deviceService.updateChannelState(light.channelId, { isOn: !light.isOn }).subscribe();
  }

  updateBrightness(light: any, value?: number) {
    this.#deviceService.updateChannelState(light.channelId, { brightness: value }).subscribe();
  }

  updateColor(light: any, color: string) {
    this.#deviceService.updateChannelState(light.channelId, { color: color }).subscribe();
  }
}
