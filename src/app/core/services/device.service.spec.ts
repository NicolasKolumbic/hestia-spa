import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Subject, of } from 'rxjs';
import { DeviceService } from './device.service';
import { WebSocketService } from './websocket.service';
import { Environment } from './environment';
import { Device } from '@core/domain/models/device';
import { DeviceChannelDto } from '../domain/dtos/device-channel.dto';

describe('DeviceService', () => {
  let service: DeviceService;
  let httpMock: HttpTestingController;
  let mockWsService: any;
  let channelUpdateSubject: Subject<any>;
  let connectSubject: Subject<any>;

  const mockCameraDevice = new Device({
    id: 'cam-1',
    name: 'Cámara Living',
    status: 'ONLINE',
    channels: [
      {
        channelId: 'ch-cam',
        deviceId: 'cam-1',
        channelIndex: 0,
        name: 'Cam Stream',
        type: 'CAMERA',
        isPrimary: true,
        isOn: true,
        brightness: 0,
        color: '#fff',
        payload: {},
      },
    ],
  });

  const mockLockDevice = new Device({
    id: 'lock-1',
    name: 'Cerradura Principal',
    status: 'ONLINE',
    channels: [
      {
        channelId: 'ch-lock',
        deviceId: 'lock-1',
        channelIndex: 0,
        name: 'Lock',
        type: 'LOCK',
        isPrimary: true,
        isOn: true,
        brightness: 0,
        color: '#fff',
        payload: {},
      },
    ],
  });

  const mockLightDevice = new Device({
    id: 'light-1',
    name: 'Luz Cocina',
    status: 'ONLINE',
    channels: [
      {
        channelId: 'ch-light',
        deviceId: 'light-1',
        channelIndex: 0,
        name: 'Light',
        type: 'SWITCH',
        isPrimary: true,
        isOn: false,
        brightness: 100,
        color: '#fff',
        payload: {},
      },
    ],
  });

  beforeEach(() => {
    channelUpdateSubject = new Subject<any>();
    connectSubject = new Subject<any>();

    mockWsService = {
      connect: jasmine.createSpy('connect'),
      listen: jasmine.createSpy('listen').and.callFake((event: string) => {
        if (event === 'channelUpdate') return channelUpdateSubject.asObservable();
        if (event === 'connect') return connectSubject.asObservable();
        return of();
      }),
    };

    TestBed.configureTestingModule({
      providers: [
        DeviceService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: WebSocketService, useValue: mockWsService },
        {
          provide: Environment,
          useValue: { apiUrl: 'http://localhost:3000/api' },
        },
      ],
    });

    service = TestBed.inject(DeviceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    service.ngOnDestroy();
    httpMock.verify();
  });

  it('should be created and connect to WebSocket', () => {
    expect(service).toBeTruthy();
    expect(mockWsService.connect).toHaveBeenCalled();
    expect(mockWsService.listen).toHaveBeenCalledWith('channelUpdate');
    expect(mockWsService.listen).toHaveBeenCalledWith('connect');
  });

  it('should expose securityDevices correctly', () => {
    service.devices.set([mockCameraDevice, mockLockDevice, mockLightDevice]);

    expect(service.securityDevices().length).toBe(2);
    expect(service.securityDevices().map(d => d.deviceId)).toEqual(['cam-1', 'lock-1']);
  });

  it('should filter lightingDevices correctly', () => {
    service.devices.set([mockCameraDevice, mockLockDevice, mockLightDevice]);
    expect(service.lightingDevices().length).toBe(1);
    expect(service.lightingDevices()[0].deviceId).toBe('light-1');
  });

  describe('D.5.2.2 Monotonic Synchronization & Reconciliation', () => {
    beforeEach(() => {
      // Seed with light-1 having isOn: false
      service.devices.set([
        new Device({
          id: 'light-1',
          name: 'Luz Cocina',
          status: 'ONLINE',
          channels: [
            {
              channelId: 'ch-light',
              deviceId: 'light-1',
              channelIndex: 0,
              name: 'Light',
              type: 'SWITCH',
              isPrimary: true,
              isOn: false,
              brightness: 100,
              color: '#fff',
              payload: {},
            },
          ],
        }),
      ]);
    });

    it('1. WebSocket SUCCEEDED arrives before HTTP IN_FLIGHT response (Race Condition Fix)', () => {
      // User clicks switch: HTTP PUT is sent
      service.updateChannelState('ch-light', { isOn: true }).subscribe();

      const req = httpMock.expectOne('http://localhost:3000/api/device-channels/ch-light');
      expect(req.request.method).toBe('PUT');

      // FAST PATH: WebSocket confirmation arrives FIRST from hardware execution
      channelUpdateSubject.next({
        channelId: 'ch-light',
        deviceId: 'light-1',
        channelIndex: 0,
        name: 'Light',
        type: 'SWITCH',
        isPrimary: true,
        isOn: true,
        payload: {
          lastProcessedCommandId: 'cmd-race-1',
          lastConfirmedAt: '2026-11-14T18:07:29.005Z',
        },
      });

      // Verify that local channel is already confirmed ON
      const confirmedChannel = service.devices()[0].channels[0];
      expect(confirmedChannel.isOn).toBeTrue();
      expect(confirmedChannel.isPending).toBeFalse();

      // SLOW PATH: HTTP PUT response finally resolves with the stale in-flight snapshot
      req.flush({
        channelId: 'ch-light',
        deviceId: 'light-1',
        channelIndex: 0,
        name: 'Light',
        type: 'SWITCH',
        isPrimary: true,
        isOn: false,
        payload: {
          pendingState: {
            commandId: 'cmd-race-1',
            requestedState: { isOn: true },
            requestedAt: '2026-11-14T18:07:28.800Z',
            status: 'IN_FLIGHT',
          },
        },
      });

      // CRITICAL ASSERTION: The stale snapshot must be rejected, preserving confirmed ON
      const finalChannel = service.devices()[0].channels[0];
      expect(finalChannel.isOn).toBeTrue();
      expect(finalChannel.isPending).toBeFalse();
      expect(finalChannel.payload.lastProcessedCommandId).toBe('cmd-race-1');
    });

    it('2. HTTP IN_FLIGHT arrives before WebSocket SUCCEEDED (normal sequential flow)', () => {
      service.updateChannelState('ch-light', { isOn: true }).subscribe();

      const req = httpMock.expectOne('http://localhost:3000/api/device-channels/ch-light');

      // HTTP PUT response arrives first with pendingState
      req.flush({
        channelId: 'ch-light',
        deviceId: 'light-1',
        channelIndex: 0,
        name: 'Light',
        type: 'SWITCH',
        isPrimary: true,
        isOn: false,
        payload: {
          pendingState: {
            commandId: 'cmd-seq-2',
            requestedState: { isOn: true },
            requestedAt: new Date().toISOString(),
            status: 'IN_FLIGHT',
          },
        },
      });

      const inFlightChannel = service.devices()[0].channels[0];
      expect(inFlightChannel.isPending).toBeTrue();
      expect(inFlightChannel.isOn).toBeFalse();

      // WebSocket confirmation arrives second
      channelUpdateSubject.next({
        channelId: 'ch-light',
        deviceId: 'light-1',
        channelIndex: 0,
        name: 'Light',
        type: 'SWITCH',
        isPrimary: true,
        isOn: true,
        payload: {
          lastProcessedCommandId: 'cmd-seq-2',
          lastConfirmedAt: new Date().toISOString(),
        },
      });

      const finalChannel = service.devices()[0].channels[0];
      expect(finalChannel.isPending).toBeFalse();
      expect(finalChannel.isOn).toBeTrue();
    });

    it('3. WebSocket FAILED arrives before HTTP IN_FLIGHT response', () => {
      service.updateChannelState('ch-light', { isOn: true }).subscribe();

      const req = httpMock.expectOne('http://localhost:3000/api/device-channels/ch-light');

      // WebSocket failure arrives first
      channelUpdateSubject.next({
        channelId: 'ch-light',
        deviceId: 'light-1',
        channelIndex: 0,
        name: 'Light',
        type: 'SWITCH',
        isPrimary: true,
        isOn: false,
        payload: {
          lastFailedCommand: {
            commandId: 'cmd-fail-3',
            failedAt: '2026-11-14T18:15:05.000Z',
            error: { code: 'DEVICE_TIMEOUT', message: 'ESP32 desconectado' },
          },
        },
      });

      expect(service.devices()[0].channels[0].isPending).toBeFalse();
      expect(service.devices()[0].channels[0].payload.lastFailedCommand?.commandId).toBe('cmd-fail-3');

      // Delayed HTTP response arrives with stale IN_FLIGHT for same commandId
      req.flush({
        channelId: 'ch-light',
        deviceId: 'light-1',
        channelIndex: 0,
        name: 'Light',
        type: 'SWITCH',
        isPrimary: true,
        isOn: false,
        payload: {
          pendingState: {
            commandId: 'cmd-fail-3',
            requestedState: { isOn: true },
            requestedAt: '2026-11-14T18:15:00.000Z',
            status: 'IN_FLIGHT',
          },
        },
      });

      // Must remain failed and NOT reverted to pending
      const finalChannel = service.devices()[0].channels[0];
      expect(finalChannel.isPending).toBeFalse();
      expect(finalChannel.payload.lastFailedCommand?.commandId).toBe('cmd-fail-3');
    });

    it('4. Robust channel identification when event omits flat deviceId', () => {
      // DTO has only channelId / id without flat deviceId
      channelUpdateSubject.next({
        id: 'ch-light',
        channelIndex: 0,
        name: 'Light',
        type: 'SWITCH',
        isPrimary: true,
        isOn: true,
        payload: {
          lastProcessedCommandId: 'cmd-no-dev-id',
          lastConfirmedAt: new Date().toISOString(),
        },
      });

      const updated = service.findChannelById('ch-light');
      expect(updated).toBeDefined();
      expect(updated!.isOn).toBeTrue();
      expect(updated!.deviceId).toBe('light-1');
    });

    it('5. Rejects channel update when deviceId belongs to a different device (pertenencia validation)', () => {
      // ch-light belongs to light-1; update claims it belongs to cam-1
      channelUpdateSubject.next({
        channelId: 'ch-light',
        deviceId: 'cam-1', // MISMATCH
        channelIndex: 0,
        name: 'Light',
        type: 'SWITCH',
        isPrimary: true,
        isOn: true,
        payload: {},
      });

      // The channel on light-1 must not be modified
      const originalChannel = service.findChannelById('ch-light');
      expect(originalChannel!.isOn).toBeFalse();
    });

    it('6. Watchdog reconciles successfully when final WebSocket event is lost', fakeAsync(() => {
      service.watchdogTimeoutMs = 1000; // Fast timeout for test

      // Put channel into in-flight state via HTTP
      service.updateChannelState('ch-light', { isOn: true }).subscribe();
      const putReq = httpMock.expectOne('http://localhost:3000/api/device-channels/ch-light');
      putReq.flush({
        channelId: 'ch-light',
        deviceId: 'light-1',
        channelIndex: 0,
        name: 'Light',
        type: 'SWITCH',
        isPrimary: true,
        isOn: false,
        payload: {
          pendingState: {
            commandId: 'cmd-lost-ws',
            requestedState: { isOn: true },
            requestedAt: new Date().toISOString(),
            status: 'IN_FLIGHT',
          },
        },
      });

      expect(service.findChannelById('ch-light')!.isPending).toBeTrue();

      // Fast forward past watchdog timeout (1000ms)
      tick(1000);

      // Watchdog queries GET /api/device-channels/ch-light
      const getReq = httpMock.expectOne('http://localhost:3000/api/device-channels/ch-light');
      expect(getReq.request.method).toBe('GET');

      // PostgreSQL returns confirmed physical state (no pendingState)
      getReq.flush({
        channelId: 'ch-light',
        deviceId: 'light-1',
        channelIndex: 0,
        name: 'Light',
        type: 'SWITCH',
        isPrimary: true,
        isOn: true,
        payload: {
          lastProcessedCommandId: 'cmd-lost-ws',
          lastConfirmedAt: new Date().toISOString(),
        },
      });

      // UI recovers from in-flight to confirmed ON
      const recoveredChannel = service.findChannelById('ch-light')!;
      expect(recoveredChannel.isOn).toBeTrue();
      expect(recoveredChannel.isPending).toBeFalse();
    }));

    it('7. Watchdog reconciles FAILED state when final WebSocket event is lost', fakeAsync(() => {
      service.watchdogTimeoutMs = 1000;

      service.updateChannelState('ch-light', { isOn: true }).subscribe();
      const putReq = httpMock.expectOne('http://localhost:3000/api/device-channels/ch-light');
      putReq.flush({
        channelId: 'ch-light',
        deviceId: 'light-1',
        channelIndex: 0,
        name: 'Light',
        type: 'SWITCH',
        isPrimary: true,
        isOn: false,
        payload: {
          pendingState: {
            commandId: 'cmd-lost-fail',
            requestedState: { isOn: true },
            requestedAt: new Date().toISOString(),
            status: 'IN_FLIGHT',
          },
        },
      });

      tick(1000);

      const getReq = httpMock.expectOne('http://localhost:3000/api/device-channels/ch-light');
      getReq.flush({
        channelId: 'ch-light',
        deviceId: 'light-1',
        channelIndex: 0,
        name: 'Light',
        type: 'SWITCH',
        isPrimary: true,
        isOn: false,
        payload: {
          lastFailedCommand: {
            commandId: 'cmd-lost-fail',
            failedAt: new Date().toISOString(),
            error: { code: 'DEVICE_TIMEOUT', message: 'Hardware timeout' },
          },
        },
      });

      const failedChannel = service.findChannelById('ch-light')!;
      expect(failedChannel.isPending).toBeFalse();
      expect(failedChannel.payload.lastFailedCommand?.commandId).toBe('cmd-lost-fail');
    }));

    it('8. Watchdog marks UNCERTAIN when Cloud continues IN_FLIGHT after max attempts', fakeAsync(() => {
      service.watchdogTimeoutMs = 1000;

      service.updateChannelState('ch-light', { isOn: true }).subscribe();
      const putReq = httpMock.expectOne('http://localhost:3000/api/device-channels/ch-light');
      putReq.flush({
        channelId: 'ch-light',
        deviceId: 'light-1',
        channelIndex: 0,
        name: 'Light',
        type: 'SWITCH',
        isPrimary: true,
        isOn: false,
        payload: {
          pendingState: {
            commandId: 'cmd-stubborn',
            requestedState: { isOn: true },
            requestedAt: new Date().toISOString(),
            status: 'IN_FLIGHT',
          },
        },
      });

      // Attempt 1
      tick(1000);
      const getReq1 = httpMock.expectOne('http://localhost:3000/api/device-channels/ch-light');
      getReq1.flush({
        channelId: 'ch-light',
        deviceId: 'light-1',
        channelIndex: 0,
        name: 'Light',
        type: 'SWITCH',
        isPrimary: true,
        isOn: false,
        payload: {
          pendingState: {
            commandId: 'cmd-stubborn',
            requestedState: { isOn: true },
            requestedAt: new Date().toISOString(),
            status: 'IN_FLIGHT',
          },
        },
      });

      // Channel is still in-flight after attempt 1 (not invented success or failure)
      expect(service.findChannelById('ch-light')!.isPending).toBeTrue();

      // Attempt 2 (rescheduled for 2500ms)
      tick(2500);
      const getReq2 = httpMock.expectOne('http://localhost:3000/api/device-channels/ch-light');
      getReq2.flush({
        channelId: 'ch-light',
        deviceId: 'light-1',
        channelIndex: 0,
        name: 'Light',
        type: 'SWITCH',
        isPrimary: true,
        isOn: false,
        payload: {
          pendingState: {
            commandId: 'cmd-stubborn',
            requestedState: { isOn: true },
            requestedAt: new Date().toISOString(),
            status: 'IN_FLIGHT',
          },
        },
      });

      // Max attempts reached -> marked UNCERTAIN, unlocking the toggle
      const uncertainChannel = service.findChannelById('ch-light')!;
      expect(uncertainChannel.isPending).toBeFalse();
      expect(uncertainChannel.isUncertain).toBeTrue();
      expect(uncertainChannel.uncertainReason).toContain('sin confirmación física');
    }));

    it('9. Watchdog marks UNCERTAIN when HTTP reconciliation fails with network error', fakeAsync(() => {
      service.watchdogTimeoutMs = 1000;

      service.updateChannelState('ch-light', { isOn: true }).subscribe();
      const putReq = httpMock.expectOne('http://localhost:3000/api/device-channels/ch-light');
      putReq.flush({
        channelId: 'ch-light',
        deviceId: 'light-1',
        channelIndex: 0,
        name: 'Light',
        type: 'SWITCH',
        isPrimary: true,
        isOn: false,
        payload: {
          pendingState: {
            commandId: 'cmd-net-err',
            requestedState: { isOn: true },
            requestedAt: new Date().toISOString(),
            status: 'IN_FLIGHT',
          },
        },
      });

      tick(1000);

      const getReq = httpMock.expectOne('http://localhost:3000/api/device-channels/ch-light');
      getReq.error(new ProgressEvent('error'), { status: 0, statusText: 'Network Error' });

      const channel = service.findChannelById('ch-light')!;
      expect(channel.isPending).toBeFalse();
      expect(channel.isUncertain).toBeTrue();
      expect(channel.uncertainReason).toContain('Error de conexión');
    }));

    it('10. Cancels watchdog and cleans up resources on ngOnDestroy', fakeAsync(() => {
      service.watchdogTimeoutMs = 1000;

      service.updateChannelState('ch-light', { isOn: true }).subscribe();
      const putReq = httpMock.expectOne('http://localhost:3000/api/device-channels/ch-light');
      putReq.flush({
        channelId: 'ch-light',
        deviceId: 'light-1',
        channelIndex: 0,
        name: 'Light',
        type: 'SWITCH',
        isPrimary: true,
        isOn: false,
        payload: {
          pendingState: {
            commandId: 'cmd-destroy-clean',
            requestedState: { isOn: true },
            requestedAt: new Date().toISOString(),
            status: 'IN_FLIGHT',
          },
        },
      });

      // Destroy service before timer expires
      service.ngOnDestroy();

      expect((service as any)['activeWatchdogs'].size).toBe(0);

      // Tick time forward
      tick(2000);

      // No HTTP GET should have been requested because watchdog was cancelled on destroy
      httpMock.expectNone('http://localhost:3000/api/device-channels/ch-light');
    }));

    it('11. Fetches authoritative devices on WebSocket reconnect ("connect" event)', () => {
      connectSubject.next(null);

      const req = httpMock.expectOne('http://localhost:3000/api/devices');
      expect(req.request.method).toBe('GET');

      req.flush([
        {
          id: 'light-1',
          name: 'Luz Cocina Actualizada',
          status: 'ONLINE',
          channels: [
            {
              channelId: 'ch-light',
              deviceId: 'light-1',
              channelIndex: 0,
              name: 'Light',
              type: 'SWITCH',
              isPrimary: true,
              isOn: true,
              payload: {},
            },
          ],
        },
      ]);

      expect(service.devices().length).toBe(1);
      expect(service.devices()[0].name).toBe('Luz Cocina Actualizada');
      expect(service.devices()[0].channels[0].isOn).toBeTrue();
    });
  });
});
