import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpaceCard } from './space-card';

describe('SpaceCard', () => {
  let component: SpaceCard;
  let fixture: ComponentFixture<SpaceCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpaceCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpaceCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
