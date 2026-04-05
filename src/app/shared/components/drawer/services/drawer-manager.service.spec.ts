import { TestBed } from '@angular/core/testing';

import { DrawerManager } from './drawer-manager';

describe('DrawerManager', () => {
  let service: DrawerManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DrawerManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
