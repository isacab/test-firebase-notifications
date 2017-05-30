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
  error : string;

  constructor(private pushService: PushNotificationService) { }

  ngOnInit() {

    this.label = "Push notifications: ";

    this.pushService.pushRegistrationChanged.subscribe(() => {
      let reg = this.pushService.pushRegistration;
      let enabled = reg ? reg.enabled : false;
      
      this.isEnabled = enabled;
      this.setButtonText(enabled);
    });

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
        this.error = '';
      }).catch((error) => {
        this.error = error;
      }).then(() => {
        this.isLoading = false;
        this.canToggle = true;
      });
  }

  private setButtonText(pushIsEnabled : boolean) {
    this.buttonText = pushIsEnabled ? 'Disable' : 'Enable';
  }

}
