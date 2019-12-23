import { Component, OnInit, Input } from '@angular/core';
import { TrainingUploadComponent } from '../training-upload/training-upload.component';
import { TrainingLabelComponent } from '../training-label/training-label.component';
import { TrainingArchitectureComponent } from '../training-architecture/training-architecture.component';
import { TrainingConfigComponent } from '../training-config/training-config.component';
import { TrainingCheckComponent } from '../training-check/training-check.component';

@Component({
  selector: 'app-timeline2',
  templateUrl: './timeline2.component.html',
  styleUrls: ['./timeline2.component.css']
})
export class Timeline2Component implements OnInit {

  @Input() child0: boolean;
  @Input() child1: boolean;
  @Input() child2: boolean;
  @Input() child3: boolean;
  @Input() child4: boolean;
  
  @Input() childTitles: string[] = [];
  
  constructor() { }

  ngOnInit() {

  }

}
