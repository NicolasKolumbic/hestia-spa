import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { clientContextInterceptor } from './client-context.interceptor';
import { AuthService } from './auth.service';
import { Environment } from './environment';

describe('clientContextInterceptor', () => {
  let http: HttpClient;
  let httpTestingController: HttpTestingController;

  const mockEnvironment = {
    apiUrl: 'http://localhost:3000/api',
    gatewayUrl: 'http://localhost:8081',
    isProduction: false,
  };

  const mockAuthService = {
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      clients: [{ clientId: 'client-uuid-123' }],
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([clientContextInterceptor])),
        provideHttpClientTesting(),
        { provide: Environment, useValue: mockEnvironment },
        { provide: AuthService, useValue: mockAuthService },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should add x-client-id header for requests targeting environment.apiUrl', () => {
    http.get('http://localhost:3000/api/devices').subscribe();

    const req = httpTestingController.expectOne('http://localhost:3000/api/devices');
    expect(req.request.headers.has('x-client-id')).toBeTrue();
    expect(req.request.headers.get('x-client-id')).toBe('client-uuid-123');
    req.flush([]);
  });

  it('should NOT add x-client-id header for requests targeting environment.gatewayUrl', () => {
    http.get('http://localhost:8081/cameras/by-device/dev-1/stream').subscribe();

    const req = httpTestingController.expectOne('http://localhost:8081/cameras/by-device/dev-1/stream');
    expect(req.request.headers.has('x-client-id')).toBeFalse();
    req.flush({});
  });

  it('should NOT add x-client-id header for external or asset requests', () => {
    http.get('/assets/i18n/es.json').subscribe();

    const req = httpTestingController.expectOne('/assets/i18n/es.json');
    expect(req.request.headers.has('x-client-id')).toBeFalse();
    req.flush({});
  });
});
