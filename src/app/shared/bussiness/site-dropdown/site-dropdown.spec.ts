import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteDropdown } from './site-dropdown';

describe('SiteDropdown', () => {
  let component: SiteDropdown;
  let fixture: ComponentFixture<SiteDropdown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteDropdown]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteDropdown);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
