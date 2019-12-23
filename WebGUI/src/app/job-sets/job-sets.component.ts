import { Component, OnInit } from '@angular/core';
import { JOBSETS } from '../mock-job-sets';
import { JOBS } from '../mock-jobs';

@Component({
  selector: 'app-job-sets',
  templateUrl: './job-sets.component.html',
  styleUrls: ['./job-sets.component.css']
})
export class JobSetsComponent implements OnInit {
    jobsets = JOBSETS;
    jobs = JOBS;

    constructor() { }

    ngOnInit() {
    }

}
