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
                    tokenResponse: {
                        token: 'token-123',
                        expiresIn: 120,
                        deviceId: 'dev-1',
                        gatewayId: 'gw-1',
                        stream: {
                            protocol: 'webrtc',
                            whepUrl: 'http://localhost:8889/camara-cocina-comedor/whep',
                        },
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

    it('should enter reconnecting state when Gateway is unreachable (status 0)', async () => {
        mockCameraStreamService.resolveCameraStream.and.returnValue(
            throwError(() => ({ status: 0, message: 'Failed to fetch Gateway' }))
        );

        await component.startStream();
        fixture.detectChanges();

        expect(component.state()).toBe('reconnecting');
        expect(component.retryAttempt()).toBe(1);
        expect(component.errorMessage()).toBe('No se pudo contactar al Gateway.');
    });

    it('should enter reconnecting state on timeout error', async () => {
        mockWhepPlayerService.connect.and.rejectWith(
            new Error('Se agotó el tiempo de espera para conectar con la cámara.')
        );

        await component.startStream();
        fixture.detectChanges();

        expect(component.state()).toBe('reconnecting');
        expect(component.retryAttempt()).toBe(1);
        expect(component.errorMessage()).toBe('Se agotó el tiempo de espera para conectar con la cámara.');
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

    describe('Concurrency and Session Generation', () => {
        it('should discard stream resolution if stopStream is called while connect is in flight', async () => {
            let resolveConnect: any;
            mockWhepPlayerService.connect.and.returnValue(
                new Promise((resolve) => {
                    resolveConnect = resolve;
                })
            );

            // Start stream (async connect in flight)
            const streamPromise = component.startStream();
            expect(component.state()).toBe('connecting');

            // User clicks stop while connect is pending
            component.stopStream();
            expect(component.state()).toBe('stopped');

            // Now connect finishes later
            resolveConnect(new MediaStream());
            await streamPromise;

            // State must remain stopped and NOT flip to playing
            expect(component.state()).toBe('stopped');
            // Disconnect should have been called again to release orphan session
            expect(mockWhepPlayerService.disconnect).toHaveBeenCalledTimes(2);
        });
    });

    describe('Exponential Backoff and Retry Exhaustion', () => {
        it('should enter error state after 3 failed attempts', async () => {
            mockWhepPlayerService.connect.and.rejectWith(new Error('Network error'));

            // Attempt 1
            await component.startStream();
            expect(component.state()).toBe('reconnecting');
            expect(component.retryAttempt()).toBe(1);

            // Attempt 2
            await component.startStream(true);
            expect(component.state()).toBe('reconnecting');
            expect(component.retryAttempt()).toBe(2);

            // Attempt 3
            await component.startStream(true);
            expect(component.state()).toBe('reconnecting');
            expect(component.retryAttempt()).toBe(3);

            // Attempt 4 (exhausted)
            await component.startStream(true);
            expect(component.state()).toBe('error');
            expect(component.errorMessage()).toContain('Se agotaron los reintentos');
        });

        it('should halt retries and disconnect WebRTC resources immediately on 403 / permission rejection', async () => {
            const forbiddenError = { status: 403, message: 'Forbidden: No tenés permisos' };
            mockCameraStreamService.resolveCameraStream.and.returnValue(throwError(() => forbiddenError));

            await component.startStream();

            expect(component.state()).toBe('error');
            expect(component.errorMessage()).toContain('No tenés permisos para visualizar esta cámara');
            expect(component.retryAttempt()).toBe(0);
            expect(mockWhepPlayerService.disconnect).toHaveBeenCalled();
        });

        it('should halt retries and disconnect WebRTC resources on revoked stream error', async () => {
            const revokedError = { status: 403, message: 'Sesión revocada' };
            mockWhepPlayerService.connect.and.rejectWith(revokedError);

            await component.startStream();

            expect(component.state()).toBe('error');
            expect(component.errorMessage()).toContain('No tenés permisos para visualizar esta cámara');
            expect(component.retryAttempt()).toBe(0);
            expect(mockWhepPlayerService.disconnect).toHaveBeenCalled();
        });
    });

    describe('Stream Interruption Detection', () => {
        it('should enter reconnecting state when onStreamInterrupted callback fires during playback', () => {
            component.playerState.set('playing');
            expect(component.state()).toBe('playing');

            // Simulate WhepPlayerService detecting freeze or track ended
            mockWhepPlayerService.onStreamInterrupted();

            expect(component.state()).toBe('reconnecting');
            expect(component.retryAttempt()).toBe(1);
            expect(component.errorMessage()).toContain('Se interrumpió la señal de video');
        });
    });

    describe('Multi-Camera Independence', () => {
        let whepA: any;
        let whepB: any;
        let fixtureA: ComponentFixture<CameraPlayer>;
        let fixtureB: ComponentFixture<CameraPlayer>;
        let camA: CameraPlayer;
        let camB: CameraPlayer;

        beforeEach(async () => {
            let instanceCount = 0;
            whepA = {
                state: signal<StreamState>('playing'),
                errorMessage: signal<string | null>(null),
                mediaStream: signal<MediaStream | null>(null),
                disconnect: jasmine.createSpy('disconnectA'),
            };
            whepB = {
                state: signal<StreamState>('playing'),
                errorMessage: signal<string | null>(null),
                mediaStream: signal<MediaStream | null>(null),
                disconnect: jasmine.createSpy('disconnectB'),
            };

            await TestBed.resetTestingModule();
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
                        {
                            provide: WhepPlayerService,
                            useFactory: () => {
                                instanceCount++;
                                return instanceCount === 1 ? whepA : whepB;
                            },
                        },
                    ],
                },
            })
            .compileComponents();

            fixtureA = TestBed.createComponent(CameraPlayer);
            camA = fixtureA.componentInstance;
            fixtureA.componentRef.setInput('deviceId', 'cam-1');
            fixtureA.detectChanges();

            fixtureB = TestBed.createComponent(CameraPlayer);
            camB = fixtureB.componentInstance;
            fixtureB.componentRef.setInput('deviceId', 'cam-2');
            fixtureB.detectChanges();
        });

        it('should maintain independent sessions so stopping Camera A does not affect Camera B', () => {
            camA.playerState.set('playing');
            camB.playerState.set('playing');

            expect(camA.state()).toBe('playing');
            expect(camB.state()).toBe('playing');

            // Stop Camera A
            camA.stopStream();

            expect(camA.state()).toBe('stopped');
            expect(whepA.disconnect).toHaveBeenCalled();

            // Camera B remains playing and its disconnect was not called
            expect(camB.state()).toBe('playing');
            expect(whepB.disconnect).not.toHaveBeenCalled();

            fixtureA.destroy();
            fixtureB.destroy();
        });
    });
});
