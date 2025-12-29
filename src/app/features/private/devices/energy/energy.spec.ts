import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Energy } from './energy';

describe('Energy', () => {
  let component: Energy;
  let fixture: ComponentFixture<Energy>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Energy]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Energy);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
