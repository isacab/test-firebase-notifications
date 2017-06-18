import { Component, OnInit, Input } from '@angular/core';
import { TestPushNotificationsService } from '../../services/test-push-notifications.service';
import { PushNotificationService } from '../../services/push-notification.service';
import { Test } from '../../models/test';

@Component({
  selector: 'test-push-data',
  templateUrl: './test-push-data.component.html',
  styleUrls: ['./test-push-data.component.css']
})
export class TestPushDataComponent implements OnInit {

  @Input() test : Test;

  constructor() { }

  ngOnInit() {
  }

  trackNotification(index, notification) {
    return notification ? notification.sequenceNumber : undefined;
  }

}
