import { Component, OnInit, Input } from '@angular/core';
import { Test } from '../../../models/test';

@Component({
  selector: 'test-info',
  templateUrl: './test-info.component.html',
  styleUrls: ['./test-info.component.css']
})
export class TestInfoComponent implements OnInit {

  @Input("model") test : Test;

  constructor() { }

  ngOnInit() {
  }

}
