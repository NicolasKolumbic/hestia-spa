import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { DeviceService } from './device.service';
import { WebSocketService } from './websocket.service';
import { Environment } from './environment';
import { Device } from '@core/domain/models/device';

describe('DeviceService', () => {
  let service: DeviceService;
  let httpMock: HttpTestingController;
  let mockWsService: any;

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
        isOn: true,
        brightness: 100,
        color: '#fff',
        payload: {},
      },
    ],
  });

  beforeEach(() => {
    mockWsService = {
      connect: jasmine.createSpy('connect'),
      listen: jasmine.createSpy('listen').and.returnValue(of()),
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

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(mockWsService.connect).toHaveBeenCalled();
  });

  it('should expose securityDevices correctly', () => {
    service.devices.set([mockCameraDevice, mockLockDevice, mockLightDevice]);

    // securityDevices includes CAMERA, LOCK, SENSOR_MOTION
    expect(service.securityDevices().length).toBe(2);
    expect(service.securityDevices().map(d => d.deviceId)).toEqual(['cam-1', 'lock-1']);
  });

  it('should filter lightingDevices correctly', () => {
    service.devices.set([mockCameraDevice, mockLockDevice, mockLightDevice]);
    expect(service.lightingDevices().length).toBe(1);
    expect(service.lightingDevices()[0].deviceId).toBe('light-1');
  });
});
