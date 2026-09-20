import { TestBed } from '@angular/core/testing';

import { DrawerManagerService } from './drawer-manager.service';

describe('DrawerManagerService', () => {
  let service: DrawerManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DrawerManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
