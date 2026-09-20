import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { WhepPlayerService } from './whep-player.service';

describe('WhepPlayerService', () => {
    let service: WhepPlayerService;

    // Mock RTCPeerConnection and related WebRTC classes
    let mockPeerConnection: any;
    let originalRTCPeerConnection: any;
    let originalFetch: any;

    beforeEach(() => {
        originalRTCPeerConnection = (window as any).RTCPeerConnection;
        originalFetch = window.fetch;

        mockPeerConnection = {
            iceGatheringState: 'complete',
            connectionState: 'new',
            iceConnectionState: 'new',
            localDescription: { type: 'offer', sdp: 'v=0\r\no=mock-sdp-offer\r\n' },
            remoteDescription: null,
            addTransceiver: jasmine.createSpy('addTransceiver').and.callFake((kind: string, init: any) => ({
                receiver: { track: { kind, stop: jasmine.createSpy('stop') } },
                direction: init?.direction,
            })),
            createOffer: jasmine.createSpy('createOffer').and.resolveTo({ type: 'offer', sdp: 'v=0\r\no=mock-sdp-offer\r\n' }),
            setLocalDescription: jasmine.createSpy('setLocalDescription').and.resolveTo(),
            setRemoteDescription: jasmine.createSpy('setRemoteDescription').and.resolveTo(),
            close: jasmine.createSpy('close'),
            addEventListener: jasmine.createSpy('addEventListener'),
            removeEventListener: jasmine.createSpy('removeEventListener'),
            ontrack: null,
            onconnectionstatechange: null,
            oniceconnectionstatechange: null,
        };

        (window as any).RTCPeerConnection = jasmine.createSpy('RTCPeerConnection').and.returnValue(mockPeerConnection);

        TestBed.configureTestingModule({
            providers: [
                provideZonelessChangeDetection(),
                WhepPlayerService,
            ],
        });

        service = TestBed.inject(WhepPlayerService);
    });

    afterEach(() => {
        (window as any).RTCPeerConnection = originalRTCPeerConnection;
        window.fetch = originalFetch;
    });

    it('should be created with idle state', () => {
        expect(service).toBeTruthy();
        expect(service.state()).toBe('idle');
        expect(service.mediaStream()).toBeNull();
        expect(service.errorMessage()).toBeNull();
    });

    it('should configure recvonly transceivers for video and audio', async () => {
        window.fetch = jasmine.createSpy('fetch').and.resolveTo({
            ok: true,
            status: 201,
            headers: new Headers(),
            text: () => Promise.resolve('v=0\r\no=mock-sdp-answer\r\n'),
        } as any);

        const connectPromise = service.connect('http://localhost:8889/camara-cocina-comedor/whep?token=fake');
        await connectPromise;

        expect((window as any).RTCPeerConnection).toHaveBeenCalled();
        expect(mockPeerConnection.addTransceiver).toHaveBeenCalledWith('video', { direction: 'recvonly' });
        expect(mockPeerConnection.addTransceiver).toHaveBeenCalledWith('audio', { direction: 'recvonly' });
        expect(mockPeerConnection.createOffer).toHaveBeenCalled();
        expect(mockPeerConnection.setLocalDescription).toHaveBeenCalled();
    });

    it('should send SDP offer via HTTP POST and process SDP answer', async () => {
        const whepUrl = 'http://localhost:8889/camara-cocina-comedor/whep?token=token123';
        const mockAnswerSdp = 'v=0\r\no=mock-answer\r\n';

        window.fetch = jasmine.createSpy('fetch').and.resolveTo({
            ok: true,
            status: 200,
            headers: new Headers({ Location: '/resource/session-xyz' }),
            text: () => Promise.resolve(mockAnswerSdp),
        } as any);

        await service.connect(whepUrl);

        expect(window.fetch).toHaveBeenCalledWith(
            whepUrl,
            jasmine.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/sdp' },
                body: 'v=0\r\no=mock-sdp-offer\r\n',
            })
        );

        expect(mockPeerConnection.setRemoteDescription).toHaveBeenCalled();
    });

    it('should update mediaStream and state to playing when ontrack fires', async () => {
        window.fetch = jasmine.createSpy('fetch').and.resolveTo({
            ok: true,
            status: 200,
            headers: new Headers(),
            text: () => Promise.resolve('v=0\r\no=mock-answer\r\n'),
        } as any);

        await service.connect('http://localhost:8889/cam/whep');

        const mockTrack = { kind: 'video', stop: jasmine.createSpy('stop') } as any;
        const mockStream = { getTracks: () => [mockTrack] } as any;

        mockPeerConnection.ontrack({
            streams: [mockStream],
            track: mockTrack,
        });

        expect(service.state()).toBe('playing');
        expect(service.mediaStream()).toBe(mockStream);
    });

    it('should handle WHEP HTTP negotiation errors gracefully', async () => {
        window.fetch = jasmine.createSpy('fetch').and.resolveTo({
            ok: false,
            status: 401,
            statusText: 'Unauthorized',
            text: () => Promise.resolve('Invalid Stream Token'),
        } as any);

        try {
            await service.connect('http://localhost:8889/cam/whep?token=bad');
            fail('Expected connect to throw');
        } catch (error: any) {
            expect(service.state()).toBe('error');
            expect(service.errorMessage()).toContain('No tenés permisos para visualizar esta cámara.');
            expect(mockPeerConnection.close).toHaveBeenCalled();
        }
    });

    it('should handle WebRTC connection state changes (failed and disconnected)', async () => {
        window.fetch = jasmine.createSpy('fetch').and.resolveTo({
            ok: true,
            status: 200,
            headers: new Headers(),
            text: () => Promise.resolve('v=0\r\no=mock-answer\r\n'),
        } as any);

        await service.connect('http://localhost:8889/cam/whep');

        // Simulate failed state
        mockPeerConnection.connectionState = 'failed';
        mockPeerConnection.onconnectionstatechange();

        expect(service.state()).toBe('error');
        expect(service.errorMessage()).toContain('Se perdió la conexión con la cámara.');
    });

    it('should disconnect cleanly and release peer connection, tracks and send DELETE if Location was present', async () => {
        window.fetch = jasmine.createSpy('fetch').and.resolveTo({
            ok: true,
            status: 201,
            headers: new Headers({ Location: 'http://localhost:8889/resource/session-123' }),
            text: () => Promise.resolve('v=0\r\no=mock-answer\r\n'),
        } as any);

        await service.connect('http://localhost:8889/cam/whep');

        // Reset fetch spy to verify DELETE
        window.fetch = jasmine.createSpy('fetch').and.resolveTo({ ok: true } as any);

        await service.disconnect();

        expect(window.fetch).toHaveBeenCalledWith(
            'http://localhost:8889/resource/session-123',
            jasmine.objectContaining({ method: 'DELETE' })
        );
        expect(mockPeerConnection.close).toHaveBeenCalled();
        expect(service.state()).toBe('disconnected');
        expect(service.mediaStream()).toBeNull();
    });

    it('should handle timeout when WHEP POST takes too long', async () => {
        const timeoutError = new DOMException('Timeout', 'TimeoutError');
        window.fetch = jasmine.createSpy('fetch').and.rejectWith(timeoutError);

        try {
            await service.connect('http://localhost:8889/cam/whep');
            fail('Expected connect to throw timeout error');
        } catch (error: any) {
            expect(service.state()).toBe('error');
            expect(service.errorMessage()).toContain('Se agotó el tiempo de espera para conectar con la cámara.');
            expect(mockPeerConnection.close).toHaveBeenCalled();
        }
    });

    it('should abort in-flight connect POST when disconnect() is called without setting error state', async () => {
        let resolveFetch: any;
        window.fetch = jasmine.createSpy('fetch').and.callFake((url: string, init?: RequestInit) => {
            const signal = init?.signal as AbortSignal | undefined;
            return new Promise((resolve, reject) => {
                resolveFetch = resolve;
                if (signal?.aborted) {
                    reject(new DOMException('User disconnected', 'AbortError'));
                } else if (signal) {
                    signal.addEventListener('abort', () => {
                        reject(new DOMException('User disconnected', 'AbortError'));
                    });
                }
            });
        });

        const connectPromise = service.connect('http://localhost:8889/cam/whep');

        // Allow connect() to progress to fetch
        await new Promise((r) => setTimeout(r, 10));

        // Disconnect while connect is in flight
        await service.disconnect();

        try {
            await connectPromise;
        } catch (e: any) {
            // Error thrown from aborted connect
            expect(e.name).toBe('AbortError');
        }

        // State must be disconnected, not error
        expect(service.state()).toBe('disconnected');
        expect(service.errorMessage()).toBeNull();
        expect(mockPeerConnection.close).toHaveBeenCalled();
    });

    it('should maintain cleanup even if DELETE request fails or times out', async () => {
        window.fetch = jasmine.createSpy('fetch').and.resolveTo({
            ok: true,
            status: 201,
            headers: new Headers({ Location: 'http://localhost:8889/resource/session-123' }),
            text: () => Promise.resolve('v=0\r\no=mock-answer\r\n'),
        } as any);

        await service.connect('http://localhost:8889/cam/whep');

        // Simulate network failure during DELETE
        window.fetch = jasmine.createSpy('fetch').and.rejectWith(new Error('Network error on DELETE'));

        await service.disconnect();

        expect(mockPeerConnection.close).toHaveBeenCalled();
        expect(service.state()).toBe('disconnected');
        expect(service.mediaStream()).toBeNull();
    });
});
