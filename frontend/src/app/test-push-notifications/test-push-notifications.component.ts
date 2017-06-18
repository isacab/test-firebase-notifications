import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { TestPushNotificationsService } from '../services/test-push-notifications.service';
import { PushNotificationService } from '../services/push-notification.service';
import { ReceivedPushNotificationsService } from '../services/received-push-notifications.service';
import { ApiService } from '../services/api.service';
import { PushRegistration } from '../models/push-registration';
import { Test } from '../models/test';
import { NotificationData } from '../models/notification-data';

import 'rxjs/add/operator/switchMap';

declare var navigator: any;

@Component({
  selector: 'test-push-notifications',
  templateUrl: './test-push-notifications.component.html',
  styleUrls: ['./test-push-notifications.component.css']
})
export class TestPushNotificationsComponent implements OnInit {

  currentTest : Test;
  isEnabled? : boolean;
  isLoaded : boolean;
  error : string;

  constructor(
    private pushService : PushNotificationService, 
    private receivedService : ReceivedPushNotificationsService,
    private api : ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.route.params
      // (+) converts string 'id' to a number
      .switchMap((params: Params) => {
        let id = +params['id'];

        if(!id)
          return Promise.resolve(undefined);
        else
          return this.api.getTest(id);
      }).subscribe((test) => {
        if(test)
          this.currentTest = test;
      }, 
      (error) => {
        this.error = "Could not load test";
      });

    this.pushService.pushRegistrationChanged.subscribe(() => {
      let reg = this.pushService.pushRegistration;
      this.isEnabled = reg ? reg.enabled : false;
    });

    this.pushService.isInitializedChanged.subscribe(() => {
      this.updateIsLoaded();
    });

    if('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        this.updateIsLoaded();
      });
    }

    this.receivedService.received.subscribe((notificationData : NotificationData) => {
      this.updateReceivedNotifications(notificationData);
    });
  }

  setTest(test : Test) {
    this.currentTest = test;
  }

  updateIsLoaded() {
    let initialized = this.pushService.isInitialized;
    let ready = false;
    if('serviceWorker' in navigator)
      ready = navigator.serviceWorker.controller ? true : false;

    this.isLoaded = initialized && ready;
  }

  updateReceivedNotifications(notificationData : NotificationData) {
    if(!this.currentTest || !notificationData || this.currentTest.id !== notificationData.testId)
      return;

    if(!this.currentTest.notifications)
      this.currentTest.notifications = [];

    this.currentTest.notifications.push(notificationData);
  }

}
