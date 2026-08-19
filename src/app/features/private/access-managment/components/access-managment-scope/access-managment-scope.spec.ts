import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessManagmentScope } from './access-managment-scope';

describe('AccessManagmentScope', () => {
  let component: AccessManagmentScope;
  let fixture: ComponentFixture<AccessManagmentScope>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessManagmentScope]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessManagmentScope);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
