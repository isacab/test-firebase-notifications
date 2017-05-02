import { Component, OnInit } from '@angular/core';
import { PushNotificationService } from '../../push-notification.service';

@Component({
  selector: 'toggle-push',
  templateUrl: './toggle-push.component.html',
  styleUrls: ['./toggle-push.component.css']
})
export class TogglePushComponent implements OnInit {

  label: string;
  isPushEnabled: boolean;
  canEnablePush: boolean;

  constructor(private pushService: PushNotificationService) { }

  ngOnInit() {
    this.label = "Enable push notifications!";
    this.isPushEnabled = false;
    this.canEnablePush = false;
  }

}
