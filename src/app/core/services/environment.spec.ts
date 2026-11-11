import { TestBed } from '@angular/core/testing';
import { Environment } from './environment';
import { getSocketUrl } from '../../app.config';

describe('Environment', () => {
  let service: Environment;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Environment);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return socketUrl consistent with current environment', () => {
    expect(service.socketUrl).toBeDefined();
    if (service.isProduction) {
      expect(service.socketUrl).toBe('https://hestia-web-api.onrender.com');
    } else {
      expect(service.socketUrl).toBe('http://localhost:3000');
    }
  });

  it('getSocketUrl should resolve the backend origin without /api suffix', () => {
    const resolvedUrl = getSocketUrl();
    expect(resolvedUrl).not.toContain('/api');
    expect(resolvedUrl.startsWith('http')).toBeTrue();
  });
});
