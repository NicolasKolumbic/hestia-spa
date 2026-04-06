import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolesDropdown } from './roles-dropdown';

describe('RolesDropdown', () => {
  let component: RolesDropdown;
  let fixture: ComponentFixture<RolesDropdown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolesDropdown]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolesDropdown);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
