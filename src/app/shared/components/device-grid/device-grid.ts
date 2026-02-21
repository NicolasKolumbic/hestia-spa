import { Component, input, output, signal, TemplateRef, viewChild } from '@angular/core';
import { Device } from '@core/domain/models/device';
import { Menu } from "primeng/menu";
import { Button } from "primeng/button";
import { MenuItem } from 'primeng/api';
import { NgTemplateOutlet } from '@angular/common';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'hta-device-grid',
  imports: [Menu, Button, NgTemplateOutlet, MatIcon],
  templateUrl: './device-grid.html',
  styleUrl: './device-grid.css',
})
export class DeviceGrid {
  title = input.required<string>();
  addLabel = input.required<string>();
  devices = input.required<Device[]>();
  menuItems = input<MenuItem[]>();

  add = output<void>();

  selected = signal<Device | null>(null);

  headerTemplate = viewChild.required<TemplateRef<any>>('header');
  contentTemplate = viewChild.required<TemplateRef<any>>('content');

  addHandler(): void {
    this.add.emit();
  }
}
