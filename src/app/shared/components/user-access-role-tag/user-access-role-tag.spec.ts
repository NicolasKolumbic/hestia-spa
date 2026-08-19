import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAccessRoleTag } from './user-access-role-tag';

describe('UserAccessRoleTag', () => {
  let component: UserAccessRoleTag;
  let fixture: ComponentFixture<UserAccessRoleTag>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserAccessRoleTag]
    })
      .compileComponents();

    fixture = TestBed.createComponent(UserAccessRoleTag);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
