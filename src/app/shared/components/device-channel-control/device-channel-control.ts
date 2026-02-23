import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SliderModule } from 'primeng/slider';
import { DeviceChannel } from '@core/domain/models/device-channel';

/**
 * Generic device channel control.
 * Renders the appropriate UI based on the channel type.
 * To support a new device type, simply add a new @case here.
 */
@Component({
    selector: 'hta-device-channel-control',
    standalone: true,
    imports: [CommonModule, FormsModule, ToggleSwitchModule, SliderModule],
    template: `
        @switch(channel.type) {
            @case ('SWITCH') {
                <p-toggleSwitch [ngModel]="channel.isOn" (ngModelChange)="toggleChanged.emit($event)" />
            }
            @case ('DIMMER') {
                <div class="flex flex-col gap-2">
                    <p-toggleSwitch [ngModel]="channel.isOn" (ngModelChange)="toggleChanged.emit($event)" />
                    <p-slider [ngModel]="channel.brightness" (ngModelChange)="brightnessChanged.emit($event)"
                        [style]="{'width': '100%'}" [min]="0" [max]="100" />
                </div>
            }
            @case ('RGB_LIGHT') {
                <div class="flex flex-col gap-2">
                    <p-toggleSwitch [ngModel]="channel.isOn" (ngModelChange)="toggleChanged.emit($event)" />
                    <div class="flex items-center gap-3">
                        <p-slider [ngModel]="channel.brightness" (ngModelChange)="brightnessChanged.emit($event)"
                            class="flex-1" [style]="{'width': '100%'}" [min]="0" [max]="100" />
                        <button
                            (click)="colorPickerRequested.emit(channel)"
                            [disabled]="!channel.isOn"
                            class="w-8 h-8 rounded-full border-2 border-white shadow-sm cursor-pointer hover:scale-110 transition-transform disabled:opacity-50"
                            [style.background-color]="channel.color">
                        </button>
                    </div>
                </div>
            }
            @case ('THERMOSTAT') {
                <div class="flex flex-col gap-1 text-sm">
                    <span class="text-[var(--surface-500)]">Setpoint: {{ channel.payload['targetTemp'] ?? '—' }}°C</span>
                    <span class="text-[var(--surface-400)] capitalize">Modo: {{ channel.payload['mode'] ?? '—' }}</span>
                </div>
            }
            @case ('SENSOR_TEMP') {
                <div class="flex items-center gap-2 text-lg font-semibold">
                    <i class="pi pi-sun text-orange-400"></i>
                    <span>{{ channel.payload['value'] ?? '—' }} °C</span>
                </div>
            }
            @case ('SENSOR_HUMIDITY') {
                <div class="flex items-center gap-2 text-lg font-semibold">
                    <i class="pi pi-cloud text-blue-400"></i>
                    <span>{{ channel.payload['value'] ?? '—' }} %</span>
                </div>
            }
            @case ('SENSOR_MOTION') {
                <div class="flex items-center gap-2">
                    <i class="pi pi-eye"
                        [class.text-green-400]="channel.payload['detected']"
                        [class.text-surface-400]="!channel.payload['detected']"></i>
                    <span>{{ channel.payload['detected'] ? 'Movimiento detectado' : 'Sin movimiento' }}</span>
                </div>
            }
            @case ('SENSOR_POWER') {
                <div class="flex items-center gap-2 text-lg font-semibold">
                    <i class="pi pi-bolt text-yellow-400"></i>
                    <span>{{ channel.payload['value'] ?? '—' }} W</span>
                </div>
            }
            @case ('LOCK') {
                <div class="flex items-center gap-3">
                    <i [class]="channel.payload['lockState'] === 'locked' ? 'pi pi-lock text-red-400' : 'pi pi-lock-open text-green-400'" class="text-2xl"></i>
                    <span class="capitalize">{{ channel.payload['lockState'] ?? '—' }}</span>
                </div>
            }
            @case ('CAMERA') {
                <div class="flex items-center gap-2 text-[var(--surface-400)]">
                    <i class="pi pi-video text-xl"></i>
                    <span class="text-sm">Stream disponible</span>
                </div>
            }
            @default {
                <span class="text-xs text-[var(--surface-400)]">{{ channel.type }}</span>
            }
        }
    `,
})
export class DeviceChannelControl {
    @Input({ required: true }) channel!: DeviceChannel;
    @Output() toggleChanged = new EventEmitter<boolean>();
    @Output() brightnessChanged = new EventEmitter<number>();
    @Output() colorPickerRequested = new EventEmitter<DeviceChannel>();
}
