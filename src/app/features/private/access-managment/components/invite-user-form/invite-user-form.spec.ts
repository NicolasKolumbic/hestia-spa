import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InviteUserForm } from './invite-user-form';

describe('InviteUserForm', () => {
  let component: InviteUserForm;
  let fixture: ComponentFixture<InviteUserForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InviteUserForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InviteUserForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
