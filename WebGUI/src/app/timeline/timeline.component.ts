import { Component, OnInit, Input } from '@angular/core';
import { TrainingUploadComponent } from '../training-upload/training-upload.component';
import { TrainingLabelComponent } from '../training-label/training-label.component';
import { TrainingArchitectureComponent } from '../training-architecture/training-architecture.component';
import { TrainingConfigComponent } from '../training-config/training-config.component';
import { TrainingCheckComponent } from '../training-check/training-check.component';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
export class TimelineComponent implements OnInit {

  @Input() childUpload: boolean;
  @Input() childLabel: boolean;
  @Input() childArchitecture: boolean;
  @Input() childConfig: boolean;
  @Input() childCheck: boolean;

  constructor() { }

  ngOnInit() {

  }

}
