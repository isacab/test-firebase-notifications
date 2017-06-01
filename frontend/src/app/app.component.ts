import { Component, OnInit } from '@angular/core';

import { PushNotificationService } from './services/push-notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  title : string = 'Test Firebase Push Notifications';
  error : string;

  constructor(private pushService : PushNotificationService) { }

  ngOnInit() {
    this.pushService.initialize()
      .then(() => this.pushService.loadPushRegistration())
      .catch((err) => {
        this.error = err.message ? err.message : err;
      });
  }
}
