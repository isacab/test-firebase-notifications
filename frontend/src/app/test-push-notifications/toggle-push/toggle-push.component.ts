import { Component, OnInit } from '@angular/core';
import { PushNotificationService } from '../../services/push-notification.service';

@Component({
  selector: 'toggle-push',
  templateUrl: './toggle-push.component.html',
  styleUrls: ['./toggle-push.component.css']
})
export class TogglePushComponent implements OnInit {

  label: string;
  isEnabled: boolean;
  canEnablePush: boolean;
  buttonText: string;

  constructor(private pushService: PushNotificationService) { }

  ngOnInit() {
    let pushReg = this.pushService.getPushRegistration();

    console.log("Is initialize: ", this.pushService.isInitialized);

    this.label = "Push notifications!";

    this.setIsEnabled(pushReg.enabled);

    this.pushService.checkAvailable().then(() => {
      this.canEnablePush = true;
    });
  }

  toggleEnabled() {
    this.pushService.setEnabled(!this.isEnabled).then(() => {
      this.setIsEnabled(!this.isEnabled);
    });
  }

  private setIsEnabled(value : boolean) {
    this.isEnabled = value;
    this.buttonText = value ? 'Disable' : 'Enable';
  }

}
