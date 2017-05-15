import { Component, OnInit } from '@angular/core';
import { PushNotificationService } from '../../services/push-notification.service';

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

    this.isPushEnabled = this.pushService.isEnabled;
    this.canEnablePush = this.pushService.canEnable;

    this.pushService.isEnabledChanged.subscribe((newValue) => {
      this.isPushEnabled = newValue;
    });

    this.pushService.canEnableChanged.subscribe((newValue) => {
      this.canEnablePush = newValue;
    });
  }

  onChange(checked: boolean) {
    this.pushService.setEnabled(checked);
  }

}
