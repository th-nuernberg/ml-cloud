import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationCheckComponent } from './evaluation-check.component';

describe('EvaluationCheckComponent', () => {
  let component: EvaluationCheckComponent;
  let fixture: ComponentFixture<EvaluationCheckComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EvaluationCheckComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluationCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
