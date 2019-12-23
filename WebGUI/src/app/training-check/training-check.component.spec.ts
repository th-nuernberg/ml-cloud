import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingCheckComponent } from './training-check.component';

describe('TrainingCheckComponent', () => {
  let component: TrainingCheckComponent;
  let fixture: ComponentFixture<TrainingCheckComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrainingCheckComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainingCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
