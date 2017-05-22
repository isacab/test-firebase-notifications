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
  canToggle: boolean;
  buttonText: string;
  isLoading : boolean;

  constructor(private pushService: PushNotificationService) { }

  ngOnInit() {
    let pushReg = this.pushService.getPushRegistration();

    console.log("Is initialize: ", this.pushService.isInitialized);

    this.label = "Push notifications: ";

    this.isEnabled = pushReg.enabled;
    this.setButtonText(pushReg.enabled);

    this.pushService.checkAvailable().then(() => {
      this.canToggle = true;
    });
  }

  toggleEnabled() {
    if(!this.canToggle)
      return;

    this.canToggle = false;
    this.isLoading = true;
    this.pushService.setEnabled(!this.isEnabled)
      .then(() => {
        this.isEnabled = !this.isEnabled;
      }).catch((error) => {
        // Show error message
      }).then(() => {
        this.isLoading = false;
        this.canToggle = true;
      });
  }

  private setButtonText(pushIsEnabled : boolean) {
    this.buttonText = pushIsEnabled ? 'Disable' : 'Enable';
  }

}
