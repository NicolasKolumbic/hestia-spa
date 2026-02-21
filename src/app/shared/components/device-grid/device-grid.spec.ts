import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceGrid } from './device-grid';

describe('DeviceGrid', () => {
  let component: DeviceGrid;
  let fixture: ComponentFixture<DeviceGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeviceGrid]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeviceGrid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
