import { Component, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { TestService } from "app/services/test.service";

@Component({
  selector: 'test-push-details',
  templateUrl: './test-push-details.component.html',
  styleUrls: ['./test-push-details.component.css']
})
export class TestPushDetailsComponent implements OnInit {

  error : string;

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
        this.error = "Could not load test: " + error;
      });
  }

}
