import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientLocationCard } from './client-location-card';

describe('ClientLocationCard', () => {
  let component: ClientLocationCard;
  let fixture: ComponentFixture<ClientLocationCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientLocationCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientLocationCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
