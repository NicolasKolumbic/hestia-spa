import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAccessStatus } from './user-access-status';

describe('UserAccessStatus', () => {
  let component: UserAccessStatus;
  let fixture: ComponentFixture<UserAccessStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserAccessStatus]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserAccessStatus);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
