import { Component, OnInit, Input } from '@angular/core';
import { Test } from "app/models/test";

@Component({
  selector: 'new-button',
  templateUrl: './new-button.component.html',
  styleUrls: ['./new-button.component.css']
})
export class NewButtonComponent implements OnInit {

  @Input("model") test : Test;

  constructor() { }

  ngOnInit() {
  }

}
