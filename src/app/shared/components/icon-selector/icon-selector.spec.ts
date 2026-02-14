import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconSelector } from './icon-selector';

describe('IconSelector', () => {
  let component: IconSelector;
  let fixture: ComponentFixture<IconSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconSelector]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IconSelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
