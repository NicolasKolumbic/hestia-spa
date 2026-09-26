import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CameraStreamService } from './camera-stream.service';
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
});
