import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingConfigComponent } from './training-config.component';

describe('TrainingConfigComponent', () => {
  let component: TrainingConfigComponent;
  let fixture: ComponentFixture<TrainingConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrainingConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainingConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
