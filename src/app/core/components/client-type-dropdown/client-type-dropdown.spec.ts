import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientTypeDropdown } from './client-type-dropdown';

describe('ClientTypeDropdown', () => {
  let component: ClientTypeDropdown;
  let fixture: ComponentFixture<ClientTypeDropdown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientTypeDropdown]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientTypeDropdown);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
