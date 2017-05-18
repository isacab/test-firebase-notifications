import { Component, OnInit } from '@angular/core';
import { TestPushNotificationsService } from '../services/test-push-notifications.service';

@Component({
  selector: 'test-push-notifications',
  templateUrl: './test-push-notifications.component.html',
  styleUrls: ['./test-push-notifications.component.css']
})
export class TestPushNotificationsComponent implements OnInit {

  constructor(private testService : TestPushNotificationsService) { }

  get receivedMessages() : Array<any> {
    return this.testService.receivedMessages;
  }

  ngOnInit() {
    
  }

}
