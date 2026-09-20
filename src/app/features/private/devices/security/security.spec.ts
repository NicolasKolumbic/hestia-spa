import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { Security } from './security';
import { DeviceService } from '@core/services/device.service';
import { Device } from '@core/domain/models/device';
import { CameraStreamService } from '@core/services/camera-stream.service';
import { CameraPlayer } from './components/camera-player/camera-player';

describe('Security', () => {
  let component: Security;
  let fixture: ComponentFixture<Security>;

  let mockDevicesSignal: any;
  let mockCameraDevicesSignal: any;
  let mockDeviceService: any;
  let mockCameraStreamService: any;

  const mockCameraDevice1 = new Device({
    id: 'cam-device-1',
    name: 'Cámara Cocina Comedor',
    status: 'ONLINE',
    manufacturer: 'TP-Link',
    model: 'Tapo C210',
    serialNumber: 'SN-12345',
    channels: [
      {
        channelId: 'ch-cam-1',
        deviceId: 'cam-device-1',
        channelIndex: 0,
        name: 'Stream Principal',
        type: 'CAMERA',
        isPrimary: true,
        isOn: true,
        brightness: 0,
        color: '#ffffff',
        payload: {},
      },
    ],
  });

  const mockCameraDevice2 = new Device({
    id: 'cam-device-2',
    name: 'Cámara Entrada',
    status: 'OFFLINE',
    manufacturer: 'TP-Link',
    model: 'Tapo C200',
    serialNumber: 'SN-67890',
    channels: [
      {
        channelId: 'ch-cam-2',
        deviceId: 'cam-device-2',
        channelIndex: 0,
        name: 'Stream Entrada',
        type: 'CAMERA',
        isPrimary: true,
        isOn: false,
        brightness: 0,
        color: '#ffffff',
        payload: {},
      },
    ],
  });

  const mockLightDevice = new Device({
    id: 'light-device-1',
    name: 'Luz Cocina',
    status: 'ONLINE',
    channels: [
      {
        channelId: 'ch-light-1',
        deviceId: 'light-device-1',
        channelIndex: 0,
        name: 'Luz',
        type: 'SWITCH',
        isPrimary: true,
        isOn: true,
        brightness: 100,
        color: '#ffffff',
        payload: {},
      },
    ],
  });

  const mockLockDevice = new Device({
    id: 'lock-device-1',
    name: 'Cerradura Entrada',
    status: 'ONLINE',
    channels: [
      {
        channelId: 'ch-lock-1',
        deviceId: 'lock-device-1',
        channelIndex: 0,
        name: 'Cerradura',
        type: 'LOCK',
        isPrimary: true,
        isOn: true,
        brightness: 0,
        color: '#ffffff',
        payload: {},
      },
    ],
  });

  beforeEach(async () => {
    mockDevicesSignal = signal<Device[]>([mockCameraDevice1, mockCameraDevice2, mockLightDevice, mockLockDevice]);
    mockCameraDevicesSignal = signal<Device[]>([mockCameraDevice1, mockCameraDevice2]);

    mockDeviceService = {
      devices: mockDevicesSignal,
      cameraDevices: mockCameraDevicesSignal,
      getAllDevices: jasmine.createSpy('getAllDevices').and.returnValue(of([])),
    };

    mockCameraStreamService = {
      resolveCameraStream: jasmine.createSpy('resolveCameraStream').and.returnValue(of(null)),
    };

    await TestBed.configureTestingModule({
      imports: [Security],
      providers: [
        provideZonelessChangeDetection(),
        { provide: DeviceService, useValue: mockDeviceService },
        { provide: CameraStreamService, useValue: mockCameraStreamService },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Security);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and call getAllDevices on init', () => {
    expect(component).toBeTruthy();
    expect(mockDeviceService.getAllDevices).toHaveBeenCalled();
  });

  it('should render only camera devices and filter out non-camera devices', () => {
    const cameraCards = fixture.debugElement.queryAll(By.css('hta-camera-player'));
    expect(cameraCards.length).toBe(2);

    const names = fixture.nativeElement.textContent;
    expect(names).toContain('Cámara Cocina Comedor');
    expect(names).toContain('Cámara Entrada');
    expect(names).not.toContain('Luz Cocina');
    expect(names).not.toContain('Cerradura Entrada');
  });

  it('should pass correct deviceId and cameraName to each CameraPlayer instance', () => {
    const players = fixture.debugElement.queryAll(By.directive(CameraPlayer));
    expect(players.length).toBe(2);

    const player1 = players[0].componentInstance as CameraPlayer;
    expect(player1.deviceId()).toBe('cam-device-1');
    expect(player1.cameraName()).toBe('Cámara Cocina Comedor');
    expect(player1.autoPlay()).toBeFalse();

    const player2 = players[1].componentInstance as CameraPlayer;
    expect(player2.deviceId()).toBe('cam-device-2');
    expect(player2.cameraName()).toBe('Cámara Entrada');
    expect(player2.autoPlay()).toBeFalse();
  });

  it('should not initiate any WebRTC connections automatically upon entering Security', () => {
    expect(mockCameraStreamService.resolveCameraStream).not.toHaveBeenCalled();
  });

  it('should display camera count badge in header', () => {
    expect(component.totalCameras()).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('2 cámaras disponibles');
  });

  it('should display empty state when no camera devices are available', () => {
    mockCameraDevicesSignal.set([]);
    fixture.detectChanges();

    const players = fixture.debugElement.queryAll(By.directive(CameraPlayer));
    expect(players.length).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('No hay cámaras registradas');
  });
});
