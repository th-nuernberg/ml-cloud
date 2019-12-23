import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Timeline3Component } from './timeline3.component';

describe('Timeline3Component', () => {
  let component: Timeline3Component;
  let fixture: ComponentFixture<Timeline3Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Timeline3Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Timeline3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
