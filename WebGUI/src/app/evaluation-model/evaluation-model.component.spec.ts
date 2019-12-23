import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationModelComponent } from './evaluation-model.component';

describe('EvaluationModelComponent', () => {
  let component: EvaluationModelComponent;
  let fixture: ComponentFixture<EvaluationModelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EvaluationModelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluationModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
