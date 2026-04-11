import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardsGrid } from './cards-grid';

describe('CardsGrid', () => {
  let component: CardsGrid;
  let fixture: ComponentFixture<CardsGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardsGrid]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardsGrid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
