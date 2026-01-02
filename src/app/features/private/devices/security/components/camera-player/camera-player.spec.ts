import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CameraPlayer } from './camera-player';

describe('CameraPlayer', () => {
  let component: CameraPlayer;
  let fixture: ComponentFixture<CameraPlayer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CameraPlayer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CameraPlayer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
