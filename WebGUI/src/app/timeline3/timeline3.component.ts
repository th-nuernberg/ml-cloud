import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-timeline3',
  templateUrl: './timeline3.component.html',
  styleUrls: ['./timeline3.component.css']
})
export class Timeline3Component implements OnInit {

  @Input() childModel: boolean;
  @Input() childData: boolean;
  @Input() childView: boolean;
  @Input() childCheck: boolean;

  constructor() { }

  ngOnInit() {
  }

}
