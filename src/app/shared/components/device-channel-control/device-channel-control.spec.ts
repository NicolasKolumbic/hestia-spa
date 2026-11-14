import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
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

  const setChannel = (ch: DeviceChannel) => {
    const isFirst = !component.channel;
    const prev = component.channel;
    component.channel = ch;
    component.ngOnChanges({
      channel: new SimpleChange(prev, ch, isFirst),
    });
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeviceChannelControl],
    }).compileComponents();

    fixture = TestBed.createComponent(DeviceChannelControl);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    setChannel(createChannel());
    expect(component).toBeTruthy();
  });

  it('should render toggle switch enabled when channel is not pending', () => {
    setChannel(createChannel({ isOn: false }));

    const compiled = fixture.nativeElement as HTMLElement;
    const toggle = compiled.querySelector('p-toggleswitch');
    expect(toggle).toBeTruthy();
    expect(component.channel.isPending).toBeFalse();
  });

  it('should render spinner and "Encendiendo..." when channel is pending with target state ON', () => {
    setChannel(
      createChannel({
        isOn: false,
        payload: {
          pendingState: {
            commandId: 'cmd-1',
            requestedState: { isOn: true },
            status: 'IN_FLIGHT',
            requestedAt: new Date().toISOString(),
          },
        },
      }),
    );

    expect(component.channel.isPending).toBeTrue();
    expect(component.channel.pendingIsOn).toBeTrue();

    const compiled = fixture.nativeElement as HTMLElement;
    const spinner = compiled.querySelector('.pi-spinner');
    expect(spinner).toBeTruthy();
    expect(compiled.textContent).toContain('Encendiendo...');
  });

  it('should render spinner and "Apagando..." when channel is pending with target state OFF', () => {
    setChannel(
      createChannel({
        isOn: true,
        payload: {
          pendingState: {
            commandId: 'cmd-2',
            requestedState: { isOn: false },
            status: 'IN_FLIGHT',
            requestedAt: new Date().toISOString(),
          },
        },
      }),
    );

    expect(component.channel.isPending).toBeTrue();
    expect(component.channel.pendingIsOn).toBeFalse();

    const compiled = fixture.nativeElement as HTMLElement;
    const spinner = compiled.querySelector('.pi-spinner');
    expect(spinner).toBeTruthy();
    expect(compiled.textContent).toContain('Apagando...');
  });

  it('should render "Sin confirmar" badge when channel is uncertain due to timeout', () => {
    setChannel(
      createChannel({
        isOn: false,
        payload: {
          lastUncertainCommand: {
            commandId: 'cmd-timeout',
            status: 'TIMED_OUT',
            reason: 'El actuador no respondió dentro del límite de tiempo',
          },
        },
      }),
    );

    expect(component.channel.isUncertain).toBeTrue();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Sin confirmar');
  });

  // -------------------------------------------------------------------------
  // HESTIA D.5.2.1: 10 Scenarios for Active Error Management
  // -------------------------------------------------------------------------

  // Scenario 1: Initial load with historical lastFailedCommand (must NOT show Error badge)
  it('1. should NOT render "Error" badge on initial load when channel has historical lastFailedCommand', () => {
    setChannel(
      createChannel({
        isOn: false,
        payload: {
          lastFailedCommand: {
            commandId: 'cmd-fail-old',
            failedAt: new Date(Date.now() - 3600000).toISOString(),
            error: {
              code: 'HARDWARE_FAULT',
              message: 'Relé desconectado',
            },
          },
        },
      }),
    );

    // Historical diagnostic info remains accessible in model
    expect(component.channel.historicalError).toBe('Relé desconectado');
    expect(component.channel.lastError).toBe('Relé desconectado');

    // But active error in component must be null on initial mount
    expect(component.activeError()).toBeNull();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).not.toContain('Error');
  });

  // Scenario 2: Transition IN_FLIGHT -> FAILED (correlated by commandId)
  it('2. should show "Error" badge when correlated command transitions from IN_FLIGHT to FAILED', () => {
    // Step 1: Command dispatched in-flight
    setChannel(
      createChannel({
        isOn: false,
        payload: {
          pendingState: {
            commandId: 'cmd-fail-1',
            requestedState: { isOn: true },
            status: 'IN_FLIGHT',
            requestedAt: new Date().toISOString(),
          },
        },
      }),
    );
    expect(component.activeError()).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Encendiendo...');

    // Step 2: Command fails on hardware
    setChannel(
      createChannel({
        isOn: false,
        payload: {
          lastFailedCommand: {
            commandId: 'cmd-fail-1',
            failedAt: new Date().toISOString(),
            error: {
              code: 'DEVICE_TIMEOUT',
              message: 'Actuator did not confirm execution within 5.0s',
            },
          },
        },
      }),
    );

    expect(component.activeError()).toBe('Actuator did not confirm execution within 5.0s');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Error');
    expect(component.channel.isOn).toBeFalse();
  });

  // Scenario 3: Transition IN_FLIGHT -> SUCCEEDED (activeError remains null)
  it('3. should keep activeError null and clear spinner when command transitions from IN_FLIGHT to SUCCEEDED', () => {
    // Step 1: in-flight
    setChannel(
      createChannel({
        isOn: false,
        payload: {
          pendingState: {
            commandId: 'cmd-ok-1',
            requestedState: { isOn: true },
            status: 'IN_FLIGHT',
            requestedAt: new Date().toISOString(),
          },
        },
      }),
    );
    expect(component.activeError()).toBeNull();

    // Step 2: succeeded
    setChannel(
      createChannel({
        isOn: true,
        payload: {
          lastProcessedCommandId: 'cmd-ok-1',
          lastConfirmedAt: new Date().toISOString(),
        },
      }),
    );

    expect(component.activeError()).toBeNull();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).not.toContain('Error');
    expect(compiled.textContent).not.toContain('Encendiendo...');
    expect(component.channel.isOn).toBeTrue();
  });

  // Scenario 4: Subsequent confirmation supersedes earlier historical failure in model
  it('4. should treat historical error as superseded when lastConfirmedAt >= failedAt', () => {
    const channel = createChannel({
      isOn: true,
      payload: {
        lastFailedCommand: {
          commandId: 'cmd-fail-past',
          failedAt: '2026-11-14T10:00:00.000Z',
          error: { code: 'FAIL', message: 'Fallo antiguo' },
        },
        lastConfirmedAt: '2026-11-14T10:05:00.000Z',
        lastProcessedCommandId: 'cmd-ok-recent',
      },
    });

    expect(channel.historicalError).toBeUndefined();
    expect(channel.lastError).toBeUndefined();

    setChannel(channel);
    expect(component.activeError()).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('Error');
  });

  // Scenario 5: Out of order WebSocket event from another/stale commandId ignored
  it('5. should ignore out-of-order failure from another commandId', () => {
    // Step 1: In-flight with command 'cmd-new'
    setChannel(
      createChannel({
        isOn: false,
        payload: {
          pendingState: {
            commandId: 'cmd-new',
            requestedState: { isOn: true },
            status: 'IN_FLIGHT',
            requestedAt: new Date().toISOString(),
          },
        },
      }),
    );

    // Step 2: Late event from an old command 'cmd-stale' arrives without pendingState
    setChannel(
      createChannel({
        isOn: false,
        payload: {
          lastFailedCommand: {
            commandId: 'cmd-stale',
            failedAt: new Date().toISOString(),
            error: { code: 'OLD_TIMEOUT', message: 'Old failure' },
          },
        },
      }),
    );

    // The stale command does not match cmd-new -> activeError must remain null
    expect(component.activeError()).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('Error');
  });

  // Scenario 6: Consecutive commands with different commandIds clear previous error
  it('6. should clear active error upon starting consecutive user action', () => {
    // Command 1 fails
    setChannel(
      createChannel({
        isOn: false,
        payload: {
          pendingState: {
            commandId: 'cmd-1',
            requestedState: { isOn: true },
            status: 'IN_FLIGHT',
            requestedAt: new Date().toISOString(),
          },
        },
      }),
    );
    setChannel(
      createChannel({
        isOn: false,
        payload: {
          lastFailedCommand: {
            commandId: 'cmd-1',
            failedAt: new Date().toISOString(),
            error: { code: 'ERR', message: 'Error comando 1' },
          },
        },
      }),
    );
    expect(component.activeError()).toBe('Error comando 1');

    // User triggers second command: onToggleChanged clears active error immediately
    spyOn(component.toggleChanged, 'emit');
    component.onToggleChanged(true);
    expect(component.activeError()).toBeNull();
    expect(component.toggleChanged.emit).toHaveBeenCalledWith(true);
  });

  // Scenario 7: View reconstruction does NOT display historical error as active
  it('7. should not display historical error when view is reconstructed / remounted', () => {
    // Destroy first fixture
    fixture.destroy();

    // Create a brand new fixture simulating navigation back to Lighting
    fixture = TestBed.createComponent(DeviceChannelControl);
    component = fixture.componentInstance;

    setChannel(
      createChannel({
        isOn: false,
        payload: {
          lastFailedCommand: {
            commandId: 'cmd-prev-session',
            failedAt: '2026-11-14T12:00:00.000Z',
            error: { code: 'DEVICE_TIMEOUT', message: 'Timeout anterior' },
          },
        },
      }),
    );

    expect(component.activeError()).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('Error');
  });

  // Scenario 8: Dismiss manual of active error
  it('8. should allow user to manually dismiss active error', () => {
    // Cause an active error via transition
    setChannel(
      createChannel({
        isOn: false,
        payload: {
          pendingState: {
            commandId: 'cmd-to-dismiss',
            requestedState: { isOn: true },
            status: 'IN_FLIGHT',
            requestedAt: new Date().toISOString(),
          },
        },
      }),
    );
    setChannel(
      createChannel({
        isOn: false,
        payload: {
          lastFailedCommand: {
            commandId: 'cmd-to-dismiss',
            failedAt: new Date().toISOString(),
            error: { code: 'FAIL', message: 'Fallo descartable' },
          },
        },
      }),
    );

    expect(component.activeError()).toBe('Fallo descartable');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Error');

    // Click dismiss button
    const dismissBtn = compiled.querySelector('button[title="Descartar mensaje"]') as HTMLButtonElement;
    expect(dismissBtn).toBeTruthy();
    dismissBtn.click();
    fixture.detectChanges();

    expect(component.activeError()).toBeNull();
    expect(compiled.textContent).not.toContain('Error');
  });

  // Scenario 9: Toggle OFF after timeout of ON
  it('9. should allow toggle action after ON command times out', () => {
    // ON command times out
    setChannel(
      createChannel({
        isOn: false,
        payload: {
          pendingState: {
            commandId: 'cmd-on-timeout',
            requestedState: { isOn: true },
            status: 'IN_FLIGHT',
            requestedAt: new Date().toISOString(),
          },
        },
      }),
    );
    setChannel(
      createChannel({
        isOn: false,
        payload: {
          lastFailedCommand: {
            commandId: 'cmd-on-timeout',
            failedAt: new Date().toISOString(),
            error: { code: 'DEVICE_TIMEOUT', message: 'Actuator timeout' },
          },
        },
      }),
    );
    expect(component.channel.isOn).toBeFalse();
    expect(component.activeError()).toBe('Actuator timeout');

    // Next click emits toggleChanged and clears error
    spyOn(component.toggleChanged, 'emit');
    component.onToggleChanged(true);

    expect(component.activeError()).toBeNull();
    expect(component.toggleChanged.emit).toHaveBeenCalledWith(true);
  });

  // Scenario 10: Rejection of repeated commands during IN_FLIGHT
  it('10. should block and reject repeated clicks while command is IN_FLIGHT', () => {
    setChannel(
      createChannel({
        isOn: false,
        payload: {
          pendingState: {
            commandId: 'cmd-busy',
            requestedState: { isOn: true },
            status: 'IN_FLIGHT',
            requestedAt: new Date().toISOString(),
          },
        },
      }),
    );

    spyOn(component.toggleChanged, 'emit');
    component.onToggleChanged(true);

    expect(component.toggleChanged.emit).not.toHaveBeenCalled();
  });
});
