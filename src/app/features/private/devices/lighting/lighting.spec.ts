import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Lighting } from './lighting';

describe('Lighting', () => {
  let component: Lighting;
  let fixture: ComponentFixture<Lighting>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Lighting]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Lighting);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
