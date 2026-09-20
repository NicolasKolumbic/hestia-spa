import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardsGrid } from './cards-grid';

describe('CardsGrid', () => {
  let component: CardsGrid<any>;
  let fixture: ComponentFixture<CardsGrid<any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardsGrid]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardsGrid);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('items', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
