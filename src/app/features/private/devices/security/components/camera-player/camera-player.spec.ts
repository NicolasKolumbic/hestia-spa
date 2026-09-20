import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, ComponentRef, provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';
import { CameraPlayer } from './camera-player';
import { CameraStreamService, ResolvedCameraStream } from '@core/services/camera-stream.service';
import { WhepPlayerService, StreamState } from '@core/services/whep-player.service';

describe('CameraPlayer', () => {
    let component: CameraPlayer;
    let componentRef: ComponentRef<CameraPlayer>;
    let fixture: ComponentFixture<CameraPlayer>;

    let mockCameraStreamService: any;
    let mockWhepPlayerService: any;

    let whepStateSignal: any;
    let whepErrorSignal: any;
    let whepMediaStreamSignal: any;

    beforeEach(async () => {
        whepStateSignal = signal<StreamState>('idle');
        whepErrorSignal = signal<string | null>(null);
        whepMediaStreamSignal = signal<MediaStream | null>(null);

        mockCameraStreamService = {
            resolveCameraStream: jasmine.createSpy('resolveCameraStream').and.returnValue(
                of({
                    whepUrl: 'http://localhost:8889/camara-cocina-comedor/whep?token=token-123',
                    streamInfo: {
                        deviceId: 'dev-1',
                        protocol: 'webrtc',
                        path: 'camara-cocina-comedor',
                        baseUrl: 'http://localhost:8889',
                    },
                    tokenResponse: {
                        token: 'token-123',
                        expiresIn: 120,
                        deviceId: 'dev-1',
                        gatewayId: 'gw-1',
                    },
                } as ResolvedCameraStream)
            ),
        };

        mockWhepPlayerService = {
            state: whepStateSignal,
            errorMessage: whepErrorSignal,
            mediaStream: whepMediaStreamSignal,
            connect: jasmine.createSpy('connect').and.callFake(async () => {
                whepStateSignal.set('playing');
                return new MediaStream();
            }),
            disconnect: jasmine.createSpy('disconnect').and.callFake(async () => {
                whepStateSignal.set('disconnected');
            }),
        };

        await TestBed.configureTestingModule({
            imports: [CameraPlayer],
            providers: [
                provideZonelessChangeDetection(),
                { provide: CameraStreamService, useValue: mockCameraStreamService },
            ],
        })
        .overrideComponent(CameraPlayer, {
            set: {
                providers: [
                    { provide: WhepPlayerService, useValue: mockWhepPlayerService },
                ],
            },
        })
        .compileComponents();

        fixture = TestBed.createComponent(CameraPlayer);
        component = fixture.componentInstance;
        componentRef = fixture.componentRef;

        componentRef.setInput('deviceId', 'dev-1');
        componentRef.setInput('cameraName', 'Cocina Comedor');
        componentRef.setInput('autoPlay', false);

        fixture.detectChanges();
    });

    it('should create in idle state when autoPlay is false', () => {
        expect(component).toBeTruthy();
        expect(component.state()).toBe('idle');
    });

    it('should resolve stream and connect WHEP when startStream is called', async () => {
        await component.startStream();

        expect(mockCameraStreamService.resolveCameraStream).toHaveBeenCalledWith('dev-1');
        expect(mockWhepPlayerService.connect).toHaveBeenCalledWith(
            'http://localhost:8889/camara-cocina-comedor/whep?token=token-123'
        );
        expect(component.state()).toBe('playing');
    });

    it('should handle gateway 404 error appropriately', async () => {
        mockCameraStreamService.resolveCameraStream.and.returnValue(
            throwError(() => ({ status: 404, message: 'Not Found' }))
        );

        await component.startStream();

        expect(component.state()).toBe('error');
        expect(component.errorMessage()).toContain('no está disponible o está deshabilitada');
    });

    it('should request a fresh stream token on reconnect', () => {
        component.reconnect();

        expect(mockWhepPlayerService.disconnect).toHaveBeenCalled();
        expect(mockCameraStreamService.resolveCameraStream).toHaveBeenCalledWith('dev-1');
    });

    it('should toggle audio mute state', () => {
        expect(component.isMuted()).toBeTrue();

        component.toggleAudio();
        expect(component.isMuted()).toBeFalse();

        component.toggleAudio();
        expect(component.isMuted()).toBeTrue();
    });

    it('should disconnect and cleanup on destroy', () => {
        fixture.destroy();
        expect(mockWhepPlayerService.disconnect).toHaveBeenCalled();
    });
});
