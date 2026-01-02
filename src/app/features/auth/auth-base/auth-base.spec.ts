import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthBase } from './auth-base';

describe('AuthBase', () => {
  let component: AuthBase;
  let fixture: ComponentFixture<AuthBase>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthBase]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthBase);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
