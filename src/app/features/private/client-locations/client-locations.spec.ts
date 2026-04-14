import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientLocations } from './client-locations';

describe('ClientLocations', () => {
  let component: ClientLocations;
  let fixture: ComponentFixture<ClientLocations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientLocations]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientLocations);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
