import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CameraStreamService, buildWhepUrlWithSession } from './camera-stream.service';
import { Environment } from './environment';
import { StreamTokenResponseDto } from '@core/domain/dtos/stream-token-response.dto';

describe('CameraStreamService', () => {
    let service: CameraStreamService;
    let httpTestingController: HttpTestingController;

    const mockEnvironment = {
        apiUrl: 'http://localhost:3000/api',
        gatewayUrl: 'http://localhost:8081',
        isProduction: false,
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideZonelessChangeDetection(),
                CameraStreamService,
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: Environment, useValue: mockEnvironment },
            ],
        });

        service = TestBed.inject(CameraStreamService);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should request stream token with stream metadata from cloud api', () => {
        const deviceId = 'test-device-uuid-123';
        const mockResponse: StreamTokenResponseDto = {
            token: 'eyJhbGciOiJSUzI1NiJ9.test-jwt-payload',
            expiresIn: 120,
            deviceId,
            gatewayId: 'gateway-uuid-456',
            stream: {
                protocol: 'webrtc',
                whepUrl: 'https://camera-tunnel.trycloudflare.com/camara-cocina-comedor/whep',
            },
        };

        service.getStreamToken(deviceId).subscribe((response) => {
            expect(response).toEqual(mockResponse);
            expect(response.token).toBe('eyJhbGciOiJSUzI1NiJ9.test-jwt-payload');
            expect(response.stream.whepUrl).toBe(
                'https://camera-tunnel.trycloudflare.com/camara-cocina-comedor/whep',
            );
        });

        const req = httpTestingController.expectOne(
            'http://localhost:3000/api/devices/test-device-uuid-123/stream-token',
        );
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({});
        req.flush(mockResponse);
    });

    it('should resolve stream in a single HTTP request using Cloud whepUrl directly without calling gateway or modifying url', () => {
        const deviceId = 'test-device-uuid-123';
        const mockTokenResponse: StreamTokenResponseDto = {
            token: 'test.rs256.token',
            expiresIn: 120,
            deviceId,
            gatewayId: 'gw-1',
            stream: {
                protocol: 'webrtc',
                whepUrl: 'https://camera-tunnel.trycloudflare.com/camara-cocina-comedor/whep',
            },
        };

        service.resolveCameraStream(deviceId).subscribe((resolved) => {
            // Must use whepUrl directly from Cloud API response without modification
            expect(resolved.whepUrl).toBe(
                'https://camera-tunnel.trycloudflare.com/camara-cocina-comedor/whep',
            );
            expect(resolved.whepUrl).not.toContain('token');
            expect(resolved.whepUrl).not.toContain('?');
            expect(resolved.tokenResponse).toEqual(mockTokenResponse);
            expect(resolved.tokenResponse.token).toBe('test.rs256.token');
        });

        // Exactly ONE HTTP request must be made (POST to Cloud API)
        const tokenReq = httpTestingController.expectOne(
            'http://localhost:3000/api/devices/test-device-uuid-123/stream-token',
        );
        expect(tokenReq.request.method).toBe('POST');
        tokenReq.flush(mockTokenResponse);

        // Gateway :8081 must NOT be called
        httpTestingController.expectNone('http://localhost:8081/cameras/by-device/test-device-uuid-123/stream');
    });

    it('should propagate 409 Conflict errors (GATEWAY_OFFLINE / GATEWAY_MEDIA_NOT_READY / PUBLIC_MEDIA_UNAVAILABLE)', () => {
        const deviceId = 'test-device-uuid-123';

        service.resolveCameraStream(deviceId).subscribe({
            next: () => fail('Should have failed with 409 Conflict'),
            error: (error) => {
                expect(error.status).toBe(409);
            },
        });

        const tokenReq = httpTestingController.expectOne(
            'http://localhost:3000/api/devices/test-device-uuid-123/stream-token',
        );
        tokenReq.flush(
            { message: 'GATEWAY_MEDIA_NOT_READY', statusCode: 409 },
            { status: 409, statusText: 'Conflict' },
        );
    });

    it('should propagate 404 Not Found errors (CAMERA_NOT_FOUND_ON_GATEWAY / Device Not Found)', () => {
        const deviceId = 'non-existent-device';

        service.resolveCameraStream(deviceId).subscribe({
            next: () => fail('Should have failed with 404 Not Found'),
            error: (error) => {
                expect(error.status).toBe(404);
            },
        });

        const tokenReq = httpTestingController.expectOne(
            'http://localhost:3000/api/devices/non-existent-device/stream-token',
        );
        tokenReq.flush(
            { message: 'CAMERA_NOT_FOUND_ON_GATEWAY', statusCode: 404 },
            { status: 404, statusText: 'Not Found' },
        );
    });

    it('should propagate 401/403 Forbidden errors when user lacks camera permissions', () => {
        const deviceId = 'unauthorized-device';

        service.resolveCameraStream(deviceId).subscribe({
            next: () => fail('Should have failed with 403 Forbidden'),
            error: (error) => {
                expect(error.status).toBe(403);
            },
        });

        const tokenReq = httpTestingController.expectOne(
            'http://localhost:3000/api/devices/unauthorized-device/stream-token',
        );
        tokenReq.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });

    it('SECURITY: should not expose Stream JWT in URL query string or make HTTP requests to gatewayUrl', () => {
        const deviceId = 'secure-camera-dev';
        const mockTokenResponse: StreamTokenResponseDto = {
            token: 'eyJhbGciOiJSUzI1NiJ9.sensitive-signature',
            expiresIn: 120,
            deviceId,
            gatewayId: 'gw-sec-1',
            stream: {
                protocol: 'webrtc',
                whepUrl: 'https://secure-tunnel.trycloudflare.com/secure-cam/whep',
            },
        };

        service.resolveCameraStream(deviceId).subscribe((resolved) => {
            expect(resolved.whepUrl).not.toContain('?');
            expect(resolved.whepUrl).not.toContain('jwt');
            expect(resolved.whepUrl).not.toContain('sensitive-signature');
        });

        const tokenReq = httpTestingController.expectOne(
            'http://localhost:3000/api/devices/secure-camera-dev/stream-token',
        );
        tokenReq.flush(mockTokenResponse);
    });

    it('should incorporate streamSessionId into whepUrl as jti query parameter when provided', () => {
        const deviceId = 'camera-session-test-dev';
        const mockTokenResponse: StreamTokenResponseDto = {
            token: 'valid.token',
            expiresIn: 120,
            deviceId,
            gatewayId: 'gw-1',
            streamSessionId: 'session-uuid-1111-2222',
            stream: {
                protocol: 'webrtc',
                whepUrl: 'https://tunnel.com/camara-cocina/whep',
            },
        };

        service.resolveCameraStream(deviceId).subscribe((resolved) => {
            expect(resolved.whepUrl).toBe(
                'https://tunnel.com/camara-cocina/whep?jti=session-uuid-1111-2222',
            );
            expect(resolved.whepUrl).not.toContain('valid.token');
            expect(resolved.tokenResponse.streamSessionId).toBe('session-uuid-1111-2222');
        });

        const tokenReq = httpTestingController.expectOne(
            'http://localhost:3000/api/devices/camera-session-test-dev/stream-token',
        );
        tokenReq.flush(mockTokenResponse);
    });

    it('buildWhepUrlWithSession should safely handle existing query parameters and prevent duplicate jti', () => {
        // 1. Clean URL
        const u1 = buildWhepUrlWithSession('http://localhost:8889/cam/whep', 'jti-123');
        expect(u1).toBe('http://localhost:8889/cam/whep?jti=jti-123');

        // 2. Existing params preserved
        const u2 = buildWhepUrlWithSession('http://localhost:8889/cam/whep?custom=abc', 'jti-123');
        expect(u2).toBe('http://localhost:8889/cam/whep?custom=abc&jti=jti-123');

        // 3. Duplicate jti prevented (overwrites)
        const u3 = buildWhepUrlWithSession('http://localhost:8889/cam/whep?jti=old-val&other=1', 'new-val');
        expect(u3).toBe('http://localhost:8889/cam/whep?jti=new-val&other=1');

        // 4. Empty sessionId returns rawUrl untouched
        const u4 = buildWhepUrlWithSession('http://localhost:8889/cam/whep', undefined);
        expect(u4).toBe('http://localhost:8889/cam/whep');

        // 5. Remote Tailscale Serve HTTPS URL with jti and stripping any accidental token param
        const u5 = buildWhepUrlWithSession(
            'https://nicolas.tail6aa4c6.ts.net/camara-cocina-comedor/whep?token=should-be-removed',
            'session-ts-999',
        );
        expect(u5).toBe('https://nicolas.tail6aa4c6.ts.net/camara-cocina-comedor/whep?jti=session-ts-999');
        expect(u5).not.toContain('token=');
    });
});
