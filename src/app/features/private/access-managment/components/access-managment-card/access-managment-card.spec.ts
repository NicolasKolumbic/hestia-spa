import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessManagmentCard } from './access-managment-card';

describe('AccessManagmentCard', () => {
  let component: AccessManagmentCard;
  let fixture: ComponentFixture<AccessManagmentCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessManagmentCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessManagmentCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
