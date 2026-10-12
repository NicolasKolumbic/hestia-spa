import { TestBed } from '@angular/core/testing';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { DeviceTypeService } from './device-type.service';

describe('DeviceType', () => {
  let service: DeviceTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });
    service = TestBed.inject(DeviceTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
