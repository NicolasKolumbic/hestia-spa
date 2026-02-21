import { TestBed } from '@angular/core/testing';

import { DeviceTypeService } from './device-type.service';

describe('DeviceType', () => {
  let service: DeviceTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeviceTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
