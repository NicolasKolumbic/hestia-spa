import { TestBed } from '@angular/core/testing';
import { ViewContainerRef } from '@angular/core';
import { ViewContainer } from './view-container';

describe('ViewContainer', () => {
  it('should create an instance', () => {
    TestBed.configureTestingModule({
      providers: [
        ViewContainer,
        { provide: ViewContainerRef, useValue: { clear: () => {}, insert: () => {} } }
      ]
    });
    const directive = TestBed.inject(ViewContainer);
    expect(directive).toBeTruthy();
  });
});
