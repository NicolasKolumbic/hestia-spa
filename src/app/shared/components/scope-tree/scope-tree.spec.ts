import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScopeTree } from './scope-tree';

describe('ScopeTree', () => {
  let component: ScopeTree;
  let fixture: ComponentFixture<ScopeTree>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScopeTree]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScopeTree);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
