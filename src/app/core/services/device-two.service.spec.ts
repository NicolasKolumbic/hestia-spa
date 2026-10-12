import { TestBed } from '@angular/core/testing';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { DeviceTwoService } from './device-two.service';

describe('DeviceTwoService', () => {
  let service: DeviceTwoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });
    service = TestBed.inject(DeviceTwoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
