import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobSetsComponent } from './job-sets.component';

describe('JobSetsComponent', () => {
  let component: JobSetsComponent;
  let fixture: ComponentFixture<JobSetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobSetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobSetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
