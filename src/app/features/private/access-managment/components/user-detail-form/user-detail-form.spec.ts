import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDetailForm } from './user-detail-form';

describe('UserDetailForm', () => {
  let component: UserDetailForm;
  let fixture: ComponentFixture<UserDetailForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDetailForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserDetailForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
