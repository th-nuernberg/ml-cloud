import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingLabelComponent } from './training-label.component';

describe('TrainingLabelComponent', () => {
  let component: TrainingLabelComponent;
  let fixture: ComponentFixture<TrainingLabelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrainingLabelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainingLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
