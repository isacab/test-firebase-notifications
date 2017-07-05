import { Component, OnInit, Input, NgZone } from '@angular/core';
import { Test } from "app/models/test";

@Component({
  selector: 'received-table',
  templateUrl: './received-table.component.html',
  styleUrls: ['./received-table.component.css']
})
export class ReceivedTableComponent implements OnInit {

  @Input("model") test : Test;

  constructor() { }

  ngOnInit() {
  }

  trackNotification(index, notification) {
    return notification ? notification.sequenceNumber : undefined;
  }

}
