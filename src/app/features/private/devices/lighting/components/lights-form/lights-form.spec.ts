import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LightsForm } from './lights-form';

describe('LightsForm', () => {
  let component: LightsForm;
  let fixture: ComponentFixture<LightsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LightsForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LightsForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
