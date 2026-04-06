import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientManagment } from './client-managment';

describe('ClientManagment', () => {
  let component: ClientManagment;
  let fixture: ComponentFixture<ClientManagment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientManagment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientManagment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
