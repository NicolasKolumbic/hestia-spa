import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDetailSummary } from './user-detail-summary';

describe('UserDetailSummary', () => {
  let component: UserDetailSummary;
  let fixture: ComponentFixture<UserDetailSummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDetailSummary]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserDetailSummary);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
