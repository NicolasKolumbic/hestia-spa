import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Filters } from './filters';

describe('Filters', () => {
  let component: Filters<any>;
  let fixture: ComponentFixture<Filters<any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Filters]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Filters);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('fields', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
