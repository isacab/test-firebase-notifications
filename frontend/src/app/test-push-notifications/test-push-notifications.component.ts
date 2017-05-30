import { Component, OnInit } from '@angular/core';
import { TestPushNotificationsService } from '../services/test-push-notifications.service';
import { PushNotificationService } from '../services/push-notification.service';
import { PushRegistration } from '../models/push-registration';
import { Test } from '../models/test';

@Component({
  selector: 'test-push-notifications',
  templateUrl: './test-push-notifications.component.html',
  styleUrls: ['./test-push-notifications.component.css']
})
export class TestPushNotificationsComponent implements OnInit {

  isLoaded : boolean;
  isEnabled? : boolean;
  error : string;

  constructor(private testService : TestPushNotificationsService, private pushService : PushNotificationService) { }

  get receivedMessages() : Array<any> {
    return this.testService.receivedMessages;
  }

  get currentTest() : Test {
    return this.testService.currentTest;
  }

  ngOnInit() {
    this.pushService.initialize()
      .then(() => this.pushService.loadPushRegistration())
      .then(() => this.isLoaded = true)
      .catch((err) => {
        this.error = err;
      })

    this.pushService.pushRegistrationChanged.subscribe(() => {
      let reg = this.pushService.pushRegistration;
      this.isEnabled = reg ? reg.enabled : false;
    });
  }

}
