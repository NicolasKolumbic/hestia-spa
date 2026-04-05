import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessManagment } from './access-managment';

describe('AccessManagment', () => {
  let component: AccessManagment;
  let fixture: ComponentFixture<AccessManagment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessManagment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessManagment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
