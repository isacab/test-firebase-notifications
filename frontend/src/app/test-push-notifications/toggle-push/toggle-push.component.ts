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
    console.log("Is initialize: ", this.pushService.isInitialized);
    
    this.label = "Enable push notifications!";

    this.isPushEnabled = this.pushService.isEnabled;

    this.pushService.checkAvailable().then(() => {
      this.canEnablePush = true;
    });

    this.pushService.isEnabledChanged.subscribe((newValue) => {
      this.isPushEnabled = newValue;
    });
  }

  onChange(checked: boolean) {
    this.pushService.setEnabled(checked);
  }

}
