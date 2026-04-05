import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InviteUserPermission } from './invite-user-permission';

describe('InviteUserPermission', () => {
  let component: InviteUserPermission;
  let fixture: ComponentFixture<InviteUserPermission>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InviteUserPermission]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InviteUserPermission);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
