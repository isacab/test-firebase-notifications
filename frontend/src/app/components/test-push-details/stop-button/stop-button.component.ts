import { Component, OnInit, Input, Output, EventEmitter, Inject } from '@angular/core';
import { TestService } from "app/services/test.service";
import { Test } from "app/models/test";

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

  constructor(@Inject('PushNotificationService') private testService : TestService) 
  { }

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
