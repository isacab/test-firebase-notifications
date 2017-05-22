import { Component, OnInit } from '@angular/core';
import { TestPushNotificationsService } from '../../services/test-push-notifications.service';
import { PushNotificationService } from '../../services/push-notification.service';
import { Test } from '../../models/test';

@Component({
  selector: 'test-push-form',
  templateUrl: './test-push-form.component.html',
  styleUrls: ['./test-push-form.component.css']
})
export class TestPushFormComponent implements OnInit {

  isSending : boolean;
  isClearing : boolean;
  model : Test;

  constructor(private testService : TestPushNotificationsService, private pushService : PushNotificationService) { }

  ngOnInit() {
    this.model = new Test();
  }

  send() {
    let pushReg = this.pushService.getPushRegistration();
    if(pushReg) {
      let token = pushReg.token;
      this.isSending = true;
      this.testService.send(token)
        .then(() => {
          this.isSending = false;
        }).catch(() => {
          this.isSending = false;
        });
    }
  }

  clear() {
    this.isClearing = true;
    this.testService.clearTest()
      .then(() => {
        this.isClearing = false;
      }).catch(() => {
        this.isClearing = false;
      });
  }

}
