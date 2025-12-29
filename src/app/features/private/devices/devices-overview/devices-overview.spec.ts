import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevicesOverview } from './devices-overview';

describe('DevicesOverview', () => {
  let component: DevicesOverview;
  let fixture: ComponentFixture<DevicesOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevicesOverview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevicesOverview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
