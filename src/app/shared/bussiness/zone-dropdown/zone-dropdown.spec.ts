import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZoneDropdown } from './zone-dropdown';

describe('ZoneDropdown', () => {
  let component: ZoneDropdown;
  let fixture: ComponentFixture<ZoneDropdown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZoneDropdown]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZoneDropdown);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
