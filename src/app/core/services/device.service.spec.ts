import { TestBed } from '@angular/core/testing';
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

  describe('D.5.1 Bidirectional Lighting Control', () => {
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

    it('should send PUT to /api/device-channels/:id with { isOn: true } and mark channel as pending without mutating confirmed isOn', () => {
      let resultDto: DeviceChannelDto | undefined;

      service.updateChannelState('ch-light', { isOn: true }).subscribe(dto => {
        resultDto = dto;
      });

      const req = httpMock.expectOne('http://localhost:3000/api/device-channels/ch-light');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ isOn: true });

      // Cloud response with pending state (isOn remains false until physical confirmation)
      const cloudPendingResponse: DeviceChannelDto = {
        channelId: 'ch-light',
        deviceId: 'light-1',
        channelIndex: 0,
        name: 'Light',
        type: 'SWITCH',
        isPrimary: true,
        isOn: false, // Physical state still OFF
        payload: {
          pendingState: {
            commandId: 'cmd-123-abc',
            requestedState: {
              isOn: true,
            },
            status: 'IN_FLIGHT',
            requestedAt: new Date().toISOString(),
          },
        },
      };

      req.flush(cloudPendingResponse);

      expect(resultDto).toEqual(cloudPendingResponse);

      // Verify local signals
      const currentChannel = service.devices()[0].channels[0];
      expect(currentChannel.isOn).toBeFalse(); // Physical state NOT mutated prematurely
      expect(currentChannel.isPending).toBeTrue(); // Pending spinner active
      expect(currentChannel.pendingIsOn).toBeTrue(); // Target state is ON
      expect(currentChannel.pendingCommandId).toBe('cmd-123-abc');
    });

    it('should send PUT to /api/device-channels/:id with { isOn: false } when turning off', () => {
      service.updateChannelState('ch-light', { isOn: false }).subscribe();

      const req = httpMock.expectOne('http://localhost:3000/api/device-channels/ch-light');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ isOn: false });

      req.flush({
        channelId: 'ch-light',
        deviceId: 'light-1',
        channelIndex: 0,
        name: 'Light',
        type: 'SWITCH',
        isPrimary: true,
        isOn: true, // was ON
        payload: {
          pendingState: {
            commandId: 'cmd-off-456',
            requestedState: {
              isOn: false,
            },
            status: 'IN_FLIGHT',
            requestedAt: new Date().toISOString(),
          },
        },
      });

      const currentChannel = service.devices()[0].channels[0];
      expect(currentChannel.isPending).toBeTrue();
      expect(currentChannel.pendingIsOn).toBeFalse();
    });

    it('should update confirmed physical state and clear pendingState when channelUpdate arrives via WebSocket', () => {
      // 1. Initial pending state
      service.devices.update(devices => [
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
              payload: {
                pendingState: {
                  commandId: 'cmd-123-abc',
                  requestedState: {
                    isOn: true,
                  },
                  status: 'IN_FLIGHT',
                  requestedAt: new Date().toISOString(),
                },
              },
            },
          ],
        }),
      ]);

      expect(service.devices()[0].channels[0].isPending).toBeTrue();
      expect(service.devices()[0].channels[0].isOn).toBeFalse();

      // 2. Incoming physical confirmation from Gateway via Cloud WebSocket
      channelUpdateSubject.next({
        channelId: 'ch-light',
        deviceId: 'light-1',
        channelIndex: 0,
        name: 'Light',
        type: 'SWITCH',
        isPrimary: true,
        isOn: true, // Confirmed physically
        payload: {
          // pendingState cleared by Cloud
        },
      });

      // 3. Verify confirmed state in local signal
      const confirmedChannel = service.devices()[0].channels[0];
      expect(confirmedChannel.isOn).toBeTrue();
      expect(confirmedChannel.isPending).toBeFalse();
      expect(confirmedChannel.isUncertain).toBeFalse();
    });

    it('should set uncertain state when channelUpdate arrives with lastUncertainCommand (timeout)', () => {
      channelUpdateSubject.next({
        channelId: 'ch-light',
        deviceId: 'light-1',
        channelIndex: 0,
        name: 'Light',
        type: 'SWITCH',
        isPrimary: true,
        isOn: false,
        payload: {
          lastUncertainCommand: {
            commandId: 'cmd-timed-out',
            timedOutAt: new Date().toISOString(),
            status: 'TIMED_OUT',
            requestedState: {
              isOn: true,
            },
            reason: 'El comando expiró sin confirmación física del actuador',
          },
        },
      });

      const uncertainChannel = service.devices()[0].channels[0];
      expect(uncertainChannel.isOn).toBeFalse();
      expect(uncertainChannel.isPending).toBeFalse();
      expect(uncertainChannel.isUncertain).toBeTrue();
      expect(uncertainChannel.uncertainReason).toContain('sin confirmación física');
    });

    it('should handle HTTP 409 Conflict error without mutating local confirmed state', () => {
      let errorResponse: any;

      service.updateChannelState('ch-light', { isOn: true }).subscribe({
        next: () => fail('Should have failed with 409 Conflict'),
        error: (err) => {
          errorResponse = err;
        },
      });

      const req = httpMock.expectOne('http://localhost:3000/api/device-channels/ch-light');
      req.flush(
        {
          statusCode: 409,
          message: 'Existe un comando en curso para este canal. Aguarde su resolución.',
        },
        { status: 409, statusText: 'Conflict' }
      );

      expect(errorResponse.status).toBe(409);

      // Verify that local channel was never updated to pending or ON
      const channel = service.devices()[0].channels[0];
      expect(channel.isOn).toBeFalse();
      expect(channel.isPending).toBeFalse();
    });

    it('should fetch authoritative devices on WebSocket reconnect ("connect" event)', () => {
      // Simulate socket reconnect event
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
