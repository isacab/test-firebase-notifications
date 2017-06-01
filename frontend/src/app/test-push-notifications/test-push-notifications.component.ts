import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { TestPushNotificationsService } from '../services/test-push-notifications.service';
import { PushNotificationService } from '../services/push-notification.service';
import { ApiService } from '../services/api.service';
import { PushRegistration } from '../models/push-registration';
import { Test } from '../models/test';

import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'test-push-notifications',
  templateUrl: './test-push-notifications.component.html',
  styleUrls: ['./test-push-notifications.component.css']
})
export class TestPushNotificationsComponent implements OnInit {

  isEnabled? : boolean;
  isInitialized : boolean;

  test : Test;

  constructor(
    private testService : TestPushNotificationsService, 
    private pushService : PushNotificationService, 
    private api : ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  get receivedMessages() : Array<any> {
    return this.testService.receivedMessages;
  }

  get currentTest() : Test {
    return this.testService.currentTest;
  }

  trackMessage(index, message) {
    console.log(message);
    return message ? message.sequenceNumber : undefined;
  }

  ngOnInit() {
    this.route.params
      // (+) converts string 'id' to a number
      .switchMap((params: Params) => {
        let id = +params['id'];

        if(!id)
          return Promise.resolve(new Test({numNotificationsPerInterval: 1, numIntervals: 1, interval: 0}));
        else
          return this.api.getTest(id);
      }).subscribe((test) => {
        this.test = test;
      });

    this.pushService.pushRegistrationChanged.subscribe(() => {
      let reg = this.pushService.pushRegistration;
      this.isEnabled = reg ? reg.enabled : false;
    });

    this.pushService.isInitializedChanged.subscribe(() => {
      this.isInitialized = this.pushService.isInitialized;
    });
  }

}
