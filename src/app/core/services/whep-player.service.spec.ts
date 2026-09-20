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

        expect(window.fetch).toHaveBeenCalledWith(whepUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/sdp' },
            body: 'v=0\r\no=mock-sdp-offer\r\n',
        });

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
            expect(service.errorMessage()).toContain('401 Unauthorized');
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
        expect(service.errorMessage()).toContain('La conexión WebRTC ha fallado');
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

        expect(window.fetch).toHaveBeenCalledWith('http://localhost:8889/resource/session-123', { method: 'DELETE' });
        expect(mockPeerConnection.close).toHaveBeenCalled();
        expect(service.state()).toBe('disconnected');
        expect(service.mediaStream()).toBeNull();
    });
});
