import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, ComponentRef, provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
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
                    whepUrl: 'http://localhost:8889/camara-cocina-comedor/whep',
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

    it('should create in idle state when autoPlay is false without calling stream services', () => {
        expect(component).toBeTruthy();
        expect(component.state()).toBe('idle');
        expect(mockCameraStreamService.resolveCameraStream).not.toHaveBeenCalled();
        expect(mockWhepPlayerService.connect).not.toHaveBeenCalled();
    });

    it('should show "Ver cámara" button in idle state and start stream on click', async () => {
        const playBtn = fixture.debugElement.query(By.css('p-button[label="Ver cámara"]'));
        expect(playBtn).toBeTruthy();

        await component.startStream();
        fixture.detectChanges();

        expect(mockCameraStreamService.resolveCameraStream).toHaveBeenCalledWith('dev-1');
        expect(mockWhepPlayerService.connect).toHaveBeenCalledWith(
            'http://localhost:8889/camara-cocina-comedor/whep',
            'token-123'
        );
        expect(component.state()).toBe('playing');
    });

    it('should display "EN VIVO" badge only when state is playing', () => {
        whepStateSignal.set('idle');
        fixture.detectChanges();
        let liveBadge = fixture.debugElement.query(By.css('.animate-pulse'));
        expect(liveBadge).toBeFalsy();

        whepStateSignal.set('playing');
        fixture.detectChanges();
        liveBadge = fixture.debugElement.query(By.css('.animate-pulse'));
        expect(liveBadge).toBeTruthy();
        expect(liveBadge.nativeElement.textContent).toContain('EN VIVO');
    });

    it('should handle 404 error with friendly Spanish description', async () => {
        mockCameraStreamService.resolveCameraStream.and.returnValue(
            throwError(() => ({ status: 404, message: 'Not Found' }))
        );

        await component.startStream();
        fixture.detectChanges();

        expect(component.state()).toBe('error');
        expect(component.errorMessage()).toBe('Cámara no disponible.');
        expect(fixture.nativeElement.textContent).toContain('No se pudo conectar con la cámara');
        expect(fixture.nativeElement.textContent).toContain('Cámara no disponible.');
    });

    it('should handle 401/403 error with permissions message', async () => {
        mockCameraStreamService.resolveCameraStream.and.returnValue(
            throwError(() => ({ status: 403, message: 'Forbidden' }))
        );

        await component.startStream();
        fixture.detectChanges();

        expect(component.state()).toBe('error');
        expect(component.errorMessage()).toBe('No tenés permisos para visualizar esta cámara.');
    });

    it('should handle Gateway unreachable error when status is 0 or network error', async () => {
        mockCameraStreamService.resolveCameraStream.and.returnValue(
            throwError(() => ({ status: 0, message: 'Failed to fetch Gateway' }))
        );

        await component.startStream();
        fixture.detectChanges();

        expect(component.state()).toBe('error');
        expect(component.errorMessage()).toBe('No se pudo contactar al Gateway.');
    });

    it('should handle timeout error with friendly Spanish description', async () => {
        mockWhepPlayerService.connect.and.rejectWith(
            new Error('Se agotó el tiempo de espera para conectar con la cámara.')
        );

        await component.startStream();
        fixture.detectChanges();

        expect(component.state()).toBe('error');
        expect(component.errorMessage()).toBe('Se agotó el tiempo de espera para conectar con la cámara.');
        expect(fixture.nativeElement.textContent).toContain('Se agotó el tiempo de espera para conectar con la cámara.');
    });

    it('should not set visual error state when connect is aborted by user disconnect or component destroy', async () => {
        whepStateSignal.set('disconnected');
        mockWhepPlayerService.connect.and.rejectWith(
            new DOMException('Connection aborted by user', 'AbortError')
        );

        await component.startStream();
        fixture.detectChanges();

        expect(component.state()).toBe('disconnected');
        expect(component.errorMessage()).toBeNull();
    });

    it('should request a fresh stream token on reconnect/retry', () => {
        component.reconnect();

        expect(mockWhepPlayerService.disconnect).toHaveBeenCalled();
        expect(mockCameraStreamService.resolveCameraStream).toHaveBeenCalledWith('dev-1');
    });

    it('should stop the stream when stopStream is called', () => {
        component.stopStream();
        expect(mockWhepPlayerService.disconnect).toHaveBeenCalled();
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
