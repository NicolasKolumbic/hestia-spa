import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InviteUserRoleAndScope } from './invite-user-role-and-scope';

describe('InviteUserRoleAndScope', () => {
  let component: InviteUserRoleAndScope;
  let fixture: ComponentFixture<InviteUserRoleAndScope>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InviteUserRoleAndScope]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InviteUserRoleAndScope);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
