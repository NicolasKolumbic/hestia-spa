import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HestiaBrand } from './hestia-brand';

describe('HestiaBrand', () => {
  let component: HestiaBrand;
  let fixture: ComponentFixture<HestiaBrand>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HestiaBrand]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HestiaBrand);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
