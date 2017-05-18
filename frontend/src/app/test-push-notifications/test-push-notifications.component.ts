import { Component, OnInit } from '@angular/core';
import { TestPushNotificationsService } from '../services/test-push-notifications.service';
import { PushNotificationService } from '../services/push-notification.service';

@Component({
  selector: 'test-push-notifications',
  templateUrl: './test-push-notifications.component.html',
  styleUrls: ['./test-push-notifications.component.css']
})
export class TestPushNotificationsComponent implements OnInit {

  constructor(private testService : TestPushNotificationsService, private pushService : PushNotificationService) { }

  get receivedMessages() : Array<any> {
    return this.testService.receivedMessages;
  }

  get isEnabled() : boolean {
    return this.pushService.getPushRegistration().enabled;
  }

  ngOnInit() {
    
  }

}
