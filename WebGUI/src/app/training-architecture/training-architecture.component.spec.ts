import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingArchitectureComponent } from './training-architecture.component';

describe('TrainingArchitectureComponent', () => {
  let component: TrainingArchitectureComponent;
  let fixture: ComponentFixture<TrainingArchitectureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrainingArchitectureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainingArchitectureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
