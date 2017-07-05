import { Component, OnInit, Inject } from '@angular/core';
import { TestService } from "app/services/test.service";

@Component({
  selector: 'test-push-details',
  templateUrl: './test-push-details.component.html',
  styleUrls: ['./test-push-details.component.css']
})
export class TestPushDetailsComponent implements OnInit {

  isStopping : boolean;

  errors = {
    'load': '',
    'stop': ''
  };

  constructor(
    @Inject('TestService') private testService : TestService,
  ) { }

  get currentTest() {
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
      .then(() => {
        this.isStopping = false;
        this.errors.stop = '';
      }).catch((err) => {
        this.isStopping = false;
        this.errors.stop = err;
      });
  }

}
