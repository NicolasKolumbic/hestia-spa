import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceTypeDropdown } from './device-type-dropdown';

describe('DeviceTypeDropdown', () => {
  let component: DeviceTypeDropdown;
  let fixture: ComponentFixture<DeviceTypeDropdown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeviceTypeDropdown]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeviceTypeDropdown);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
