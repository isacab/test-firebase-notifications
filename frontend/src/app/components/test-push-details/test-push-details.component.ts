import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { TestPushNotificationsService } from '../../services/test-push-notifications.service';

@Component({
  selector: 'test-push-details',
  templateUrl: './test-push-details.component.html',
  styleUrls: ['./test-push-details.component.css']
})
export class TestPushDetailsComponent implements OnInit {

  error : string;

  constructor(
    private testService : TestPushNotificationsService,
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
        this.error = "Could not load test";
      });
  }

}
