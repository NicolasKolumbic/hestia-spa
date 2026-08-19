import { TestBed } from '@angular/core/testing';

import { DeviceTwoService } from './device-two.service';

describe('DeviceTwoService', () => {
  let service: DeviceTwoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeviceTwoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
