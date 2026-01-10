import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatLabelInput } from './float-label-input';

describe('FloatLabelInput', () => {
  let component: FloatLabelInput;
  let fixture: ComponentFixture<FloatLabelInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloatLabelInput]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FloatLabelInput);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
