import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAccessScopeTag } from './user-access-status-tag';

describe('UserAccessScopeTag', () => {
  let component: UserAccessScopeTag;
  let fixture: ComponentFixture<UserAccessScopeTag>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserAccessScopeTag]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserAccessScopeTag);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('status', 'ACTIVE');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
