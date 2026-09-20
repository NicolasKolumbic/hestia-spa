import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CameraStreamService } from './camera-stream.service';
import { Environment } from './environment';
import { StreamTokenResponseDto } from '@core/domain/dtos/stream-token-response.dto';
import { CameraStreamInfoDto } from '@core/domain/dtos/camera-stream-info.dto';

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

    it('should request stream token from cloud api', () => {
        const deviceId = 'test-device-uuid-123';
        const mockResponse: StreamTokenResponseDto = {
            token: 'eyJhbGciOiJSUzI1NiJ9.test-jwt-payload',
            expiresIn: 120,
            deviceId,
            gatewayId: 'gateway-uuid-456',
        };

        service.getStreamToken(deviceId).subscribe((response) => {
            expect(response).toEqual(mockResponse);
            expect(response.token).toBe('eyJhbGciOiJSUzI1NiJ9.test-jwt-payload');
        });

        const req = httpTestingController.expectOne('http://localhost:3000/api/devices/test-device-uuid-123/stream-token');
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({});
        req.flush(mockResponse);
    });

    it('should request stream info from gateway', () => {
        const deviceId = 'test-device-uuid-123';
        const mockStreamInfo: CameraStreamInfoDto = {
            deviceId,
            protocol: 'webrtc',
            path: 'camara-cocina-comedor',
            baseUrl: 'http://localhost:8889',
        };

        service.getGatewayStreamInfo(deviceId).subscribe((info) => {
            expect(info).toEqual(mockStreamInfo);
            expect(info.path).toBe('camara-cocina-comedor');
            expect(info.baseUrl).toBe('http://localhost:8889');
        });

        const req = httpTestingController.expectOne('http://localhost:8081/cameras/by-device/test-device-uuid-123/stream');
        expect(req.request.method).toBe('GET');
        req.flush(mockStreamInfo);
    });

    it('should resolve stream and construct valid WHEP url combining token and gateway info', () => {
        const deviceId = 'test-device-uuid-123';
        const mockTokenResponse: StreamTokenResponseDto = {
            token: 'test.rs256.token',
            expiresIn: 120,
            deviceId,
            gatewayId: 'gw-1',
        };
        const mockStreamInfo: CameraStreamInfoDto = {
            deviceId,
            protocol: 'webrtc',
            path: 'camara-cocina-comedor',
            baseUrl: 'http://localhost:8889',
        };

        service.resolveCameraStream(deviceId).subscribe((resolved) => {
            expect(resolved.whepUrl).toBe('http://localhost:8889/camara-cocina-comedor/whep?token=test.rs256.token');
            expect(resolved.streamInfo).toEqual(mockStreamInfo);
            expect(resolved.tokenResponse).toEqual(mockTokenResponse);
        });

        const tokenReq = httpTestingController.expectOne('http://localhost:3000/api/devices/test-device-uuid-123/stream-token');
        const gatewayReq = httpTestingController.expectOne('http://localhost:8081/cameras/by-device/test-device-uuid-123/stream');

        tokenReq.flush(mockTokenResponse);
        gatewayReq.flush(mockStreamInfo);
    });

    it('should propagate errors if stream token request fails', () => {
        const deviceId = 'test-device-uuid-123';

        service.resolveCameraStream(deviceId).subscribe({
            next: () => fail('Should have failed'),
            error: (error) => {
                expect(error.status).toBe(403);
            },
        });

        const tokenReq = httpTestingController.expectOne('http://localhost:3000/api/devices/test-device-uuid-123/stream-token');
        const gatewayReq = httpTestingController.expectOne('http://localhost:8081/cameras/by-device/test-device-uuid-123/stream');

        gatewayReq.flush({
            deviceId,
            protocol: 'webrtc',
            path: 'camara-1',
            baseUrl: 'http://localhost:8889',
        });
        tokenReq.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });

    it('should propagate errors if gateway request fails (e.g. 404 not found)', () => {
        const deviceId = 'non-existent-device';

        service.resolveCameraStream(deviceId).subscribe({
            next: () => fail('Should have failed'),
            error: (error) => {
                expect(error.status).toBe(404);
            },
        });

        const tokenReq = httpTestingController.expectOne('http://localhost:3000/api/devices/non-existent-device/stream-token');
        const gatewayReq = httpTestingController.expectOne('http://localhost:8081/cameras/by-device/non-existent-device/stream');

        tokenReq.flush({
            token: 'some.token',
            expiresIn: 120,
            deviceId,
            gatewayId: 'gw-1',
        });
        gatewayReq.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
});
