import { TestBed } from '@angular/core/testing';
import { SpaceService } from './space.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('SpaceService', () => {
  let service: SpaceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(SpaceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
