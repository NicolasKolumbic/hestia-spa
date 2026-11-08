import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Lighting } from './lighting';
import { DeviceService } from '@core/services/device.service';
import { Device } from '@core/domain/models/device';

describe('Lighting Component', () => {
  let component: Lighting;
  let fixture: ComponentFixture<Lighting>;
  let mockDeviceService: any;
  let lightingDevicesSignal: any;

  const createLightDevice = (id: string, isOn: boolean, isPending = false): Device => {
    return new Device({
      id,
      name: `Luz ${id}`,
      status: 'ONLINE',
      channels: [
        {
          channelId: `ch-${id}`,
          deviceId: id,
          channelIndex: 0,
          name: `Canal ${id}`,
          type: 'SWITCH',
          isPrimary: true,
          isOn,
          payload: isPending
            ? {
                pendingState: {
                  commandId: `cmd-${id}`,
                  requestedState: { isOn: !isOn },
                  status: 'IN_FLIGHT',
                  requestedAt: new Date().toISOString(),
                },
              }
            : {},
        },
      ],
    });
  };

  beforeEach(async () => {
    const dev1 = createLightDevice('dev-1', false);
    const dev2 = createLightDevice('dev-2', true);
    lightingDevicesSignal = signal([dev1, dev2]);

    mockDeviceService = {
      lightingDevices: lightingDevicesSignal,
      devices: signal([dev1, dev2]),
      getAllDevices: jasmine.createSpy('getAllDevices').and.returnValue(of([])),
      createDevice: jasmine.createSpy('createDevice').and.returnValue(of({})),
      updateChannelState: jasmine.createSpy('updateChannelState').and.returnValue(of({})),
    };

    await TestBed.configureTestingModule({
      imports: [Lighting],
      providers: [
        provideNoopAnimations(),
        { provide: DeviceService, useValue: mockDeviceService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Lighting);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(mockDeviceService.getAllDevices).toHaveBeenCalled();
  });

  it('should call updateChannelState when toggleLight is called for a non-pending channel', () => {
    const channel = component.devices()[0].channels[0]; // dev-1, isOn: false, isPending: false

    component.toggleLight(channel);

    expect(mockDeviceService.updateChannelState).toHaveBeenCalledWith('ch-dev-1', { isOn: true });
  });

  it('should NOT call updateChannelState when toggleLight is called for a pending channel (anti-spam guard)', () => {
    const pendingChannel = createLightDevice('dev-pending', false, true).channels[0];

    component.toggleLight(pendingChannel);

    expect(mockDeviceService.updateChannelState).not.toHaveBeenCalled();
  });

  it('should only toggle channels that are isOn and not isPending in turnAllOff', () => {
    const devOff = createLightDevice('off', false, false);
    const devOn = createLightDevice('on', true, false);
    const devPendingOn = createLightDevice('pending-on', true, true);

    lightingDevicesSignal.set([devOff, devOn, devPendingOn]);
    fixture.detectChanges();

    component.turnAllOff();

    // Only 'dev-on' should be toggled
    expect(mockDeviceService.updateChannelState).toHaveBeenCalledTimes(1);
    expect(mockDeviceService.updateChannelState).toHaveBeenCalledWith('ch-on', { isOn: false });
  });

  it('should skip channels that are pending when activateScene is called', () => {
    const devIdle = createLightDevice('idle', false, false);
    const devPending = createLightDevice('pending', false, true);

    lightingDevicesSignal.set([devIdle, devPending]);
    fixture.detectChanges();

    component.activateScene({ name: 'Lectura', icon: 'pi-book', color: '#ffaa00', brightness: 60 });

    expect(mockDeviceService.updateChannelState).toHaveBeenCalledTimes(1);
    expect(mockDeviceService.updateChannelState).toHaveBeenCalledWith('ch-idle', jasmine.objectContaining({
      isOn: true,
      payload: jasmine.objectContaining({ brightness: 60, color: '#ffaa00' }),
    }));
  });
});
