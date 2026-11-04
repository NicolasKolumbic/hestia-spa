import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { DEFAULT_RTC_CONFIGURATION, WhepPlayerService } from './whep-player.service';

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

    it('should instantiate RTCPeerConnection with default Cloudflare STUN server configuration', async () => {
        window.fetch = jasmine.createSpy('fetch').and.resolveTo({
            ok: true,
            status: 201,
            headers: new Headers(),
            text: () => Promise.resolve('v=0\r\no=mock-sdp-answer\r\n'),
        } as any);

        await service.connect('http://localhost:8889/camara-cocina-comedor/whep', 'test.jwt.token');

        expect((window as any).RTCPeerConnection).toHaveBeenCalledWith(DEFAULT_RTC_CONFIGURATION);
        expect(DEFAULT_RTC_CONFIGURATION.iceServers).toEqual([
            { urls: 'stun:stun.cloudflare.com:3478' }
        ]);
    });

    it('should accept and use custom RTCConfiguration when provided, overriding default STUN', async () => {
        window.fetch = jasmine.createSpy('fetch').and.resolveTo({
            ok: true,
            status: 201,
            headers: new Headers(),
            text: () => Promise.resolve('v=0\r\no=mock-sdp-answer\r\n'),
        } as any);

        const customConfig: RTCConfiguration = {
            iceServers: [
                { urls: 'stun:custom.stun.server:19302' },
            ],
            iceTransportPolicy: 'all',
        };

        await service.connect('http://localhost:8889/camara/whep', 'jwt-token', customConfig);

        expect((window as any).RTCPeerConnection).toHaveBeenCalledWith(customConfig);
    });

    it('should not contain any hardcoded TURN credentials in DEFAULT_RTC_CONFIGURATION', () => {
        expect(DEFAULT_RTC_CONFIGURATION.iceServers).toBeDefined();
        const servers = DEFAULT_RTC_CONFIGURATION.iceServers || [];
        for (const server of servers) {
            expect((server as any).username).toBeUndefined();
            expect((server as any).credential).toBeUndefined();
            const urls = Array.isArray(server.urls) ? server.urls : [server.urls];
            for (const u of urls) {
                expect(u.startsWith('turn:')).toBeFalse();
                expect(u.startsWith('turns:')).toBeFalse();
            }
        }
    });

    it('should configure recvonly transceivers for video and audio', async () => {
        window.fetch = jasmine.createSpy('fetch').and.resolveTo({
            ok: true,
            status: 201,
            headers: new Headers(),
            text: () => Promise.resolve('v=0\r\no=mock-sdp-answer\r\n'),
        } as any);

        const connectPromise = service.connect('http://localhost:8889/camara-cocina-comedor/whep', 'test.jwt.token');
        await connectPromise;

        expect((window as any).RTCPeerConnection).toHaveBeenCalled();
        expect(mockPeerConnection.addTransceiver).toHaveBeenCalledWith('video', { direction: 'recvonly' });
        expect(mockPeerConnection.addTransceiver).toHaveBeenCalledWith('audio', { direction: 'recvonly' });
        expect(mockPeerConnection.createOffer).toHaveBeenCalled();
        expect(mockPeerConnection.setLocalDescription).toHaveBeenCalled();
    });

    it('should send SDP offer via HTTP POST with Authorization Bearer header and process SDP answer', async () => {
        const whepUrl = 'http://localhost:8889/camara-cocina-comedor/whep';
        const streamToken = 'stream-jwt-rs256-token';
        const mockAnswerSdp = 'v=0\r\no=mock-answer\r\n';

        window.fetch = jasmine.createSpy('fetch').and.resolveTo({
            ok: true,
            status: 200,
            headers: new Headers({ Location: '/resource/session-xyz' }),
            text: () => Promise.resolve(mockAnswerSdp),
        } as any);

        await service.connect(whepUrl, streamToken);

        expect(window.fetch).toHaveBeenCalledWith(
            whepUrl,
            jasmine.objectContaining({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/sdp',
                    'Authorization': `Bearer ${streamToken}`,
                },
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

        await service.connect('http://localhost:8889/cam/whep', 'jwt-token');

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
            await service.connect('http://localhost:8889/cam/whep', 'bad-token');
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

        await service.connect('http://localhost:8889/cam/whep', 'jwt-token');

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

        await service.connect('http://localhost:8889/cam/whep', 'jwt-token');

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
            await service.connect('http://localhost:8889/cam/whep', 'jwt-token');
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

        const connectPromise = service.connect('http://localhost:8889/cam/whep', 'jwt-token');

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

        await service.connect('http://localhost:8889/cam/whep', 'jwt-token');

        // Simulate network failure during DELETE
        window.fetch = jasmine.createSpy('fetch').and.rejectWith(new Error('Network error on DELETE'));

        await service.disconnect();

        expect(mockPeerConnection.close).toHaveBeenCalled();
        expect(service.state()).toBe('disconnected');
        expect(service.mediaStream()).toBeNull();
    });

    describe('Track interruption and mute tolerance', () => {
        beforeEach(() => {
            jasmine.clock().install();
        });

        afterEach(() => {
            jasmine.clock().uninstall();
        });

        it('should bind mute, unmute, and ended listeners to incoming tracks', async () => {
            window.fetch = jasmine.createSpy('fetch').and.resolveTo({
                ok: true,
                status: 201,
                headers: new Headers(),
                text: () => Promise.resolve('v=0\r\no=mock-answer\r\n'),
            } as any);

            await service.connect('http://localhost:8889/cam/whep', 'jwt-token');

            const mockTrack: any = {
                kind: 'video',
                onmute: null,
                onunmute: null,
                onended: null,
                stop: jasmine.createSpy('stop'),
            };

            const trackEvent: any = {
                track: mockTrack,
                streams: [],
            };

            mockPeerConnection.ontrack(trackEvent);

            expect(mockTrack.onmute).toBeDefined();
            expect(mockTrack.onunmute).toBeDefined();
            expect(mockTrack.onended).toBeDefined();
            expect(service.state()).toBe('playing');
        });

        it('should trigger onStreamInterrupted if track ends', async () => {
            window.fetch = jasmine.createSpy('fetch').and.resolveTo({
                ok: true,
                status: 201,
                headers: new Headers(),
                text: () => Promise.resolve('v=0\r\no=mock-answer\r\n'),
            } as any);

            const interruptionSpy = jasmine.createSpy('onStreamInterrupted');
            service.onStreamInterrupted = interruptionSpy;

            await service.connect('http://localhost:8889/cam/whep', 'jwt-token');

            const mockTrack: any = {
                kind: 'video',
                stop: jasmine.createSpy('stop'),
            };
            mockPeerConnection.ontrack({ track: mockTrack, streams: [] });

            mockTrack.onended();

            expect(interruptionSpy).toHaveBeenCalled();
        });

        it('should trigger onStreamInterrupted only if track remains muted beyond tolerance period (2.5s)', async () => {
            window.fetch = jasmine.createSpy('fetch').and.resolveTo({
                ok: true,
                status: 201,
                headers: new Headers(),
                text: () => Promise.resolve('v=0\r\no=mock-answer\r\n'),
            } as any);

            const interruptionSpy = jasmine.createSpy('onStreamInterrupted');
            service.onStreamInterrupted = interruptionSpy;

            await service.connect('http://localhost:8889/cam/whep', 'jwt-token');

            const mockTrack: any = {
                kind: 'video',
                stop: jasmine.createSpy('stop'),
            };
            mockPeerConnection.ontrack({ track: mockTrack, streams: [] });

            // Trigger mute
            mockTrack.onmute();

            // Advance 1 second (within 2.5s tolerance)
            jasmine.clock().tick(1000);
            expect(interruptionSpy).not.toHaveBeenCalled();

            // Advance past 2.5s tolerance
            jasmine.clock().tick(1600);
            expect(interruptionSpy).toHaveBeenCalled();
        });

        it('should cancel interruption if unmute occurs within tolerance period', async () => {
            window.fetch = jasmine.createSpy('fetch').and.resolveTo({
                ok: true,
                status: 201,
                headers: new Headers(),
                text: () => Promise.resolve('v=0\r\no=mock-answer\r\n'),
            } as any);

            const interruptionSpy = jasmine.createSpy('onStreamInterrupted');
            service.onStreamInterrupted = interruptionSpy;

            await service.connect('http://localhost:8889/cam/whep', 'jwt-token');

            const mockTrack: any = {
                kind: 'video',
                stop: jasmine.createSpy('stop'),
            };
            mockPeerConnection.ontrack({ track: mockTrack, streams: [] });

            // Mute starts
            mockTrack.onmute();
            jasmine.clock().tick(1000);

            // Unmute recovers within tolerance
            mockTrack.onunmute();

            // Advance past original 2.5s timer
            jasmine.clock().tick(2000);
            expect(interruptionSpy).not.toHaveBeenCalled();
        });
    });

    describe('Remote Tailscale HTTPS, Location resolution (POST/PATCH/DELETE), and ICE errors', () => {
        it('should connect to remote Tailscale HTTPS WHEP URL with jti and resolve root-relative Location for PATCH and DELETE', async () => {
            const remoteWhepUrl = 'https://nicolas.tail6aa4c6.ts.net/camara-cocina-comedor/whep?jti=session-ts-123';
            const streamToken = 'rs256.bearer.jwt';

            window.fetch = jasmine.createSpy('fetch').and.resolveTo({
                ok: true,
                status: 201,
                headers: new Headers({ Location: '/camara-cocina-comedor/whep/6a51a60d-32dc-4918-a685-6ef41684369c' }),
                text: () => Promise.resolve('v=0\r\no=mock-answer\r\n'),
            } as any);

            await service.connect(remoteWhepUrl, streamToken);

            expect(window.fetch).toHaveBeenCalledWith(
                remoteWhepUrl,
                jasmine.objectContaining({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/sdp',
                        'Authorization': `Bearer ${streamToken}`,
                    },
                })
            );

            // Verify PATCH against resolved Tailscale HTTPS resource Location
            window.fetch = jasmine.createSpy('fetch').and.resolveTo({ ok: true, status: 204 } as any);
            const patched = await service.patchIceCandidates('a=candidate:1 1 UDP 2130706431 100.92.29.55 8189 typ host\r\n', 'etag-1');
            expect(patched).toBeTrue();
            expect(window.fetch).toHaveBeenCalledWith(
                'https://nicolas.tail6aa4c6.ts.net/camara-cocina-comedor/whep/6a51a60d-32dc-4918-a685-6ef41684369c',
                jasmine.objectContaining({
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/trickle-ice-sdpfrag',
                        'If-Match': 'etag-1',
                    },
                })
            );

            // Verify DELETE against resolved Tailscale HTTPS resource Location
            window.fetch = jasmine.createSpy('fetch').and.resolveTo({ ok: true, status: 200 } as any);
            await service.disconnect();
            expect(window.fetch).toHaveBeenCalledWith(
                'https://nicolas.tail6aa4c6.ts.net/camara-cocina-comedor/whep/6a51a60d-32dc-4918-a685-6ef41684369c',
                jasmine.objectContaining({
                    method: 'DELETE',
                })
            );
        });

        it('should normalize child-relative Location without leading slash and upstream localhost Location to Tailscale HTTPS origin', async () => {
            const remoteWhepUrl = 'https://nicolas.tail6aa4c6.ts.net/camara-cocina-comedor/whep?jti=session-ts-456';

            // Case 1: child-relative Location without leading slash ("session-child-789")
            window.fetch = jasmine.createSpy('fetch').and.resolveTo({
                ok: true,
                status: 201,
                headers: new Headers({ Location: 'session-child-789' }),
                text: () => Promise.resolve('v=0\r\no=mock-answer\r\n'),
            } as any);

            await service.connect(remoteWhepUrl, 'token-1');
            window.fetch = jasmine.createSpy('fetch').and.resolveTo({ ok: true } as any);
            await service.disconnect();

            expect(window.fetch).toHaveBeenCalledWith(
                'https://nicolas.tail6aa4c6.ts.net/camara-cocina-comedor/whep/session-child-789',
                jasmine.objectContaining({ method: 'DELETE' })
            );

            // Case 2: upstream localhost Location rewritten to Tailscale HTTPS origin
            window.fetch = jasmine.createSpy('fetch').and.resolveTo({
                ok: true,
                status: 201,
                headers: new Headers({ Location: 'http://localhost:8889/camara-cocina-comedor/whep/session-upstream-999' }),
                text: () => Promise.resolve('v=0\r\no=mock-answer\r\n'),
            } as any);

            await service.connect(remoteWhepUrl, 'token-2');
            window.fetch = jasmine.createSpy('fetch').and.resolveTo({ ok: true } as any);
            await service.disconnect();

            expect(window.fetch).toHaveBeenCalledWith(
                'https://nicolas.tail6aa4c6.ts.net/camara-cocina-comedor/whep/session-upstream-999',
                jasmine.objectContaining({ method: 'DELETE' })
            );
        });

        it('should transition to error and invoke onStreamInterrupted when ICE connection fails (UDP 8189 / Tailscale unreachable)', async () => {
            window.fetch = jasmine.createSpy('fetch').and.resolveTo({
                ok: true,
                status: 201,
                headers: new Headers({ Location: '/camara-cocina-comedor/whep/session-ice-fail' }),
                text: () => Promise.resolve('v=0\r\no=mock-answer\r\n'),
            } as any);

            const interruptionSpy = jasmine.createSpy('onStreamInterrupted');
            service.onStreamInterrupted = interruptionSpy;

            await service.connect('https://nicolas.tail6aa4c6.ts.net/camara-cocina-comedor/whep?jti=ice-1', 'jwt-token');

            mockPeerConnection.iceConnectionState = 'failed';
            mockPeerConnection.oniceconnectionstatechange();

            expect(service.state()).toBe('error');
            expect(service.errorMessage()).toBe('Se perdió la conexión con la cámara.');
            expect(interruptionSpy).toHaveBeenCalled();
        });
    });
});
