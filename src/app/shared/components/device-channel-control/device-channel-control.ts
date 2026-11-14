import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SliderModule } from 'primeng/slider';
import { DeviceChannel } from '@core/domain/models/device-channel';

/**
 * Generic device channel control.
 * Renders the appropriate UI based on the channel type.
 * Supports pending state indicators, disabled state during in-flight commands,
 * differentiation between confirmed physical state and pending requests,
 * and transient active error management correlated by commandId.
 */
@Component({
    selector: 'hta-device-channel-control',
    standalone: true,
    imports: [CommonModule, FormsModule, ToggleSwitchModule, SliderModule],
    template: `
        @switch(channel.type) {
            @case ('SWITCH') {
                <div class="flex items-center gap-3">
                    <p-toggleSwitch 
                        [ngModel]="channel.isOn" 
                        [disabled]="channel.isPending"
                        (ngModelChange)="onToggleChanged($event)" />
                    @if (channel.isPending) {
                        <span class="inline-flex items-center gap-1 text-xs text-orange-500 font-medium animate-pulse" 
                              title="Comando en vuelo hacia el actuador">
                            <i class="pi pi-spin pi-spinner text-xs"></i>
                            <span>{{ channel.pendingIsOn ? 'Encendiendo...' : 'Apagando...' }}</span>
                        </span>
                    } @else if (channel.isUncertain) {
                        <span class="inline-flex items-center gap-1 text-xs text-amber-500" 
                              [title]="channel.uncertainReason ?? 'Operación finalizada sin confirmación física'">
                            <i class="pi pi-exclamation-triangle text-xs"></i>
                            <span>Sin confirmar</span>
                        </span>
                    } @else if (activeError()) {
                        <span class="inline-flex items-center gap-1.5 text-xs text-red-500 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded border border-red-200 dark:border-red-900" 
                              [title]="activeError()!">
                            <i class="pi pi-times-circle text-xs"></i>
                            <span>Error</span>
                            <button type="button" 
                                    (click)="dismissError($event)" 
                                    class="ml-0.5 hover:text-red-700 dark:hover:text-red-300 text-[10px] cursor-pointer"
                                    title="Descartar mensaje">
                                <i class="pi pi-times"></i>
                            </button>
                        </span>
                    }
                </div>
            }
            @case ('DIMMER') {
                <div class="flex flex-col gap-2">
                    <div class="flex items-center gap-3">
                        <p-toggleSwitch 
                            [ngModel]="channel.isOn" 
                            [disabled]="channel.isPending"
                            (ngModelChange)="onToggleChanged($event)" />
                        @if (channel.isPending) {
                            <span class="inline-flex items-center gap-1 text-xs text-orange-500 font-medium animate-pulse">
                                <i class="pi pi-spin pi-spinner text-xs"></i>
                                <span>{{ channel.pendingIsOn ? 'Encendiendo...' : 'Apagando...' }}</span>
                            </span>
                        } @else if (channel.isUncertain) {
                            <span class="inline-flex items-center gap-1 text-xs text-amber-500" [title]="channel.uncertainReason">
                                <i class="pi pi-exclamation-triangle text-xs"></i>
                                <span>Sin confirmar</span>
                            </span>
                        } @else if (activeError()) {
                            <span class="inline-flex items-center gap-1.5 text-xs text-red-500 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded border border-red-200 dark:border-red-900" 
                                  [title]="activeError()!">
                                <i class="pi pi-times-circle text-xs"></i>
                                <span>Error</span>
                                <button type="button" 
                                        (click)="dismissError($event)" 
                                        class="ml-0.5 hover:text-red-700 dark:hover:text-red-300 text-[10px] cursor-pointer"
                                        title="Descartar mensaje">
                                    <i class="pi pi-times"></i>
                                </button>
                            </span>
                        }
                    </div>
                    <p-slider 
                        [ngModel]="channel.brightness" 
                        [disabled]="channel.isPending"
                        (ngModelChange)="onBrightnessChanged($event)"
                        [style]="{'width': '100%'}" 
                        [min]="0" 
                        [max]="100" />
                </div>
            }
            @case ('RGB_LIGHT') {
                <div class="flex flex-col gap-2">
                    <div class="flex items-center gap-3">
                        <p-toggleSwitch 
                            [ngModel]="channel.isOn" 
                            [disabled]="channel.isPending"
                            (ngModelChange)="onToggleChanged($event)" />
                        @if (channel.isPending) {
                            <span class="inline-flex items-center gap-1 text-xs text-orange-500 font-medium animate-pulse">
                                <i class="pi pi-spin pi-spinner text-xs"></i>
                                <span>{{ channel.pendingIsOn ? 'Encendiendo...' : 'Apagando...' }}</span>
                            </span>
                        } @else if (channel.isUncertain) {
                            <span class="inline-flex items-center gap-1 text-xs text-amber-500" [title]="channel.uncertainReason">
                                <i class="pi pi-exclamation-triangle text-xs"></i>
                                <span>Sin confirmar</span>
                            </span>
                        } @else if (activeError()) {
                            <span class="inline-flex items-center gap-1.5 text-xs text-red-500 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded border border-red-200 dark:border-red-900" 
                                  [title]="activeError()!">
                                <i class="pi pi-times-circle text-xs"></i>
                                <span>Error</span>
                                <button type="button" 
                                        (click)="dismissError($event)" 
                                        class="ml-0.5 hover:text-red-700 dark:hover:text-red-300 text-[10px] cursor-pointer"
                                        title="Descartar mensaje">
                                    <i class="pi pi-times"></i>
                                </button>
                            </span>
                        }
                    </div>
                    <div class="flex items-center gap-3">
                        <p-slider 
                            [ngModel]="channel.brightness" 
                            [disabled]="channel.isPending"
                            (ngModelChange)="onBrightnessChanged($event)"
                            class="flex-1" 
                            [style]="{'width': '100%'}" 
                            [min]="0" 
                            [max]="100" />
                        <button
                            (click)="colorPickerRequested.emit(channel)"
                            [disabled]="!channel.isOn || channel.isPending"
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
export class DeviceChannelControl implements OnChanges {
    @Input({ required: true }) channel!: DeviceChannel;
    @Output() toggleChanged = new EventEmitter<boolean>();
    @Output() brightnessChanged = new EventEmitter<number>();
    @Output() colorPickerRequested = new EventEmitter<DeviceChannel>();

    /** Local reactive active error for the current user interaction */
    readonly activeError = signal<string | null>(null);

    /** The commandId of the operation currently in-flight and observed by this component */
    private trackedCommandId: string | null = null;

    /** Tracks previous pending state to detect transitions */
    private wasPending = false;

    ngOnChanges(changes: SimpleChanges): void {
        const channelChange = changes['channel'];
        if (!channelChange) return;

        const currentChannel = this.channel;
        if (!currentChannel) return;

        const isCurrentlyPending = currentChannel.isPending;
        const currentCommandId = currentChannel.pendingCommandId ?? null;

        if (channelChange.isFirstChange()) {
            // Initial mount:
            // If already pending when mounted (e.g. quick navigation while command was running), track it.
            // Never treat pre-existing historical errors as active errors on mount.
            if (isCurrentlyPending && currentCommandId) {
                this.trackedCommandId = currentCommandId;
                this.wasPending = true;
            } else {
                this.trackedCommandId = null;
                this.wasPending = false;
            }
            this.activeError.set(null);
            return;
        }

        // Subsequent transitions:
        if (isCurrentlyPending) {
            // Channel entered or continues in IN_FLIGHT
            if (currentCommandId) {
                this.trackedCommandId = currentCommandId;
            }
            this.wasPending = true;
            this.activeError.set(null);
        } else if (this.wasPending) {
            // Transition: was in-flight, now finished
            this.wasPending = false;

            if (this.trackedCommandId) {
                const failedCmd = currentChannel.payload?.lastFailedCommand;
                const processedCmdId = currentChannel.payload?.lastProcessedCommandId;

                if (failedCmd && failedCmd.commandId === this.trackedCommandId) {
                    // Correlated failure for the specific command tracked
                    const msg = failedCmd.error?.message || 'Error en la operación';
                    this.activeError.set(msg);
                } else if (processedCmdId === this.trackedCommandId) {
                    // Correlated success for the specific command tracked
                    this.activeError.set(null);
                } else {
                    // Transitioned without matching failed or processed command (e.g. uncertain sweep)
                    this.activeError.set(null);
                }
                this.trackedCommandId = null;
            }
        } else {
            // Neither previously pending nor currently pending
            // Check if a direct update resolved or confirmed our trackedCommandId:
            if (this.trackedCommandId) {
                const failedCmd = currentChannel.payload?.lastFailedCommand;
                const processedCmdId = currentChannel.payload?.lastProcessedCommandId;

                if (failedCmd && failedCmd.commandId === this.trackedCommandId) {
                    const msg = failedCmd.error?.message || 'Error en la operación';
                    this.activeError.set(msg);
                    this.trackedCommandId = null;
                } else if (processedCmdId === this.trackedCommandId) {
                    this.activeError.set(null);
                    this.trackedCommandId = null;
                }
            }
        }
    }

    onToggleChanged(newVal: boolean): void {
            if (this.channel?.isPending) {
                return; // Guard against repeated clicks during in-flight command
            }
            this.activeError.set(null);
            this.toggleChanged.emit(newVal);
        }

        onBrightnessChanged(newVal: number): void {
            if (this.channel?.isPending) {
                return;
            }
            this.activeError.set(null);
            this.brightnessChanged.emit(newVal);
        }

        dismissError(event ?: Event): void {
            if(event) {
                event.stopPropagation();
            }
        this.activeError.set(null);
        }
    }
