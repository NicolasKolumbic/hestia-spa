import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeviceChannelControl } from './device-channel-control';
import { DeviceChannel } from '@core/domain/models/device-channel';

describe('DeviceChannelControl', () => {
  let component: DeviceChannelControl;
  let fixture: ComponentFixture<DeviceChannelControl>;

  const createChannel = (overrides: Partial<any> = {}): DeviceChannel => {
    return new DeviceChannel({
      channelId: 'ch-switch-1',
      deviceId: 'dev-1',
      channelIndex: 0,
      name: 'Luz Living',
      type: 'SWITCH',
      isPrimary: true,
      isOn: false,
      payload: {},
      ...overrides,
    });
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeviceChannelControl],
    }).compileComponents();

    fixture = TestBed.createComponent(DeviceChannelControl);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.channel = createChannel();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render toggle switch enabled when channel is not pending', () => {
    component.channel = createChannel({ isOn: false });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const toggle = compiled.querySelector('p-toggleswitch');
    expect(toggle).toBeTruthy();
    expect(component.channel.isPending).toBeFalse();
  });

  it('should render spinner and "Encendiendo..." when channel is pending with target state ON', () => {
    component.channel = createChannel({
      isOn: false,
      payload: {
        pendingState: {
          commandId: 'cmd-1',
          requestedState: { isOn: true },
          status: 'IN_FLIGHT',
          requestedAt: new Date().toISOString(),
        },
      },
    });
    fixture.detectChanges();

    expect(component.channel.isPending).toBeTrue();
    expect(component.channel.pendingIsOn).toBeTrue();

    const compiled = fixture.nativeElement as HTMLElement;
    const spinner = compiled.querySelector('.pi-spinner');
    expect(spinner).toBeTruthy();
    expect(compiled.textContent).toContain('Encendiendo...');
  });

  it('should render spinner and "Apagando..." when channel is pending with target state OFF', () => {
    component.channel = createChannel({
      isOn: true,
      payload: {
        pendingState: {
          commandId: 'cmd-2',
          requestedState: { isOn: false },
          status: 'IN_FLIGHT',
          requestedAt: new Date().toISOString(),
        },
      },
    });
    fixture.detectChanges();

    expect(component.channel.isPending).toBeTrue();
    expect(component.channel.pendingIsOn).toBeFalse();

    const compiled = fixture.nativeElement as HTMLElement;
    const spinner = compiled.querySelector('.pi-spinner');
    expect(spinner).toBeTruthy();
    expect(compiled.textContent).toContain('Apagando...');
  });

  it('should render "Sin confirmar" badge when channel is uncertain due to timeout', () => {
    component.channel = createChannel({
      isOn: false,
      payload: {
        lastUncertainCommand: {
          commandId: 'cmd-timeout',
          status: 'TIMED_OUT',
          reason: 'El actuador no respondió dentro del límite de tiempo',
        },
      },
    });
    fixture.detectChanges();

    expect(component.channel.isUncertain).toBeTrue();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Sin confirmar');
  });

  it('should render "Error" badge when channel has lastError', () => {
    component.channel = createChannel({
      isOn: false,
      payload: {
        lastFailedCommand: {
          commandId: 'cmd-fail',
          failedAt: new Date().toISOString(),
          error: {
            code: 'HARDWARE_FAULT',
            message: 'Relé desconectado',
          },
        },
      },
    });
    fixture.detectChanges();

    expect(component.channel.lastError).toBe('Relé desconectado');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Error');
  });

  it('should guard against repeated clicks and block toggleChanged when channel is pending', () => {
    component.channel = createChannel({
      isOn: false,
      payload: {
        pendingState: {
          commandId: 'cmd-busy',
          requestedState: { isOn: true },
          status: 'IN_FLIGHT',
          requestedAt: new Date().toISOString(),
        },
      },
    });
    fixture.detectChanges();

    spyOn(component.toggleChanged, 'emit');

    component.onToggleChanged(true);

    expect(component.toggleChanged.emit).not.toHaveBeenCalled();
  });

  it('should emit toggleChanged when channel is not pending', () => {
    component.channel = createChannel({ isOn: false });
    fixture.detectChanges();

    spyOn(component.toggleChanged, 'emit');

    component.onToggleChanged(true);

    expect(component.toggleChanged.emit).toHaveBeenCalledWith(true);
  });
});

