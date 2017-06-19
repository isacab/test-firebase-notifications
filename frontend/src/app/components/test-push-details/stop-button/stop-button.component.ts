import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TestPushNotificationsService } from '../../../services/test-push-notifications.service';
import { Test } from '../../../models/test';

@Component({
  selector: 'stop-button',
  templateUrl: './stop-button.component.html',
  styleUrls: ['./stop-button.component.css']
})
export class StopButtonComponent implements OnInit {

  isStopping : boolean;

  errors = {
    'stop': ''
  }

  constructor(private testService : TestPushNotificationsService) { }

  get currentTest() : Test {
    return this.testService.currentTest;
  }

  ngOnInit() {
  }
  
  canStop() : boolean {
    let model = this.currentTest,
        isStopping = this.isStopping;
    return model && model.id && model.running && !isStopping;
  }

  stop() {
    this.isStopping = true;
    this.testService.stop()
      .then((test : Test) => {
        this.isStopping = false;
        this.errors.stop = '';
      }).catch((err) => {
        this.isStopping = false;
        this.errors.stop = err;
      });
  }

}
