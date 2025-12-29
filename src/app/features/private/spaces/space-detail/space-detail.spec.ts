import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpaceDetail } from './space-detail';

describe('SpaceDetail', () => {
  let component: SpaceDetail;
  let fixture: ComponentFixture<SpaceDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpaceDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpaceDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
