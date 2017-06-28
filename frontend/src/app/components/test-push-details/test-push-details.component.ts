import { Component, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

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
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  get currentTest() {
    return this.testService.currentTest;
  }

  ngOnInit() {
    this.route.params
      // (+) converts string 'id' to a number
      .switchMap((params: Params) => {
        let id = +params['id'];
        return this.testService.load(id);
      }).subscribe((test) => {
      }, 
      (error) => {
        this.errors.load = "Could not load test: " + error;
      });
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
