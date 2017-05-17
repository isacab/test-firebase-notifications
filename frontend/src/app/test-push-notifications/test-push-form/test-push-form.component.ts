import { Component, OnInit } from '@angular/core';
import { TestPushNotificationsService } from '../../services/test-push-notifications.service';
import { PushNotificationService } from '../../services/push-notification.service';

@Component({
  selector: 'test-push-form',
  templateUrl: './test-push-form.component.html',
  styleUrls: ['./test-push-form.component.css']
})
export class TestPushFormComponent implements OnInit {

  constructor(private testService : TestPushNotificationsService, private pushService : PushNotificationService) { }

  ngOnInit() {
  }

  send() {
    let pushReg = this.pushService.getPushRegistration();
    if(pushReg) {
      let token = pushReg.token;
      this.testService.send(token);
    }
  }

}
