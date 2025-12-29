import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Automation } from './automation';

describe('Automation', () => {
  let component: Automation;
  let fixture: ComponentFixture<Automation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Automation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Automation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
