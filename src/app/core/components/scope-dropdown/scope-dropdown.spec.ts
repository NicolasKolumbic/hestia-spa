import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScopeDropdown } from './scope-dropdown';

describe('ScopeDropdown', () => {
  let component: ScopeDropdown;
  let fixture: ComponentFixture<ScopeDropdown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScopeDropdown]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScopeDropdown);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
