import { Component, OnInit, Inject } from '@angular/core';
import { PushNotificationService } from 'app/services/push-notification.service';

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

  constructor(@Inject('PushNotificationService') private pushService : PushNotificationService) 
  { }

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
    }).catch((err) => {
      this.canToggle = false;
    });
  }

  toggleEnabled() {
    if(!this.canToggle)
      return;

    this.canToggle = false;
    this.isLoading = true;
    this.pushService.setEnabled(!this.isEnabled)
      .then(() => {
        this.canToggle = true;
        this.error = '';
      }).catch((error : any) => {
        if(error.code === 'messaging/permission-blocked') {
          this.canToggle = false;
          this.error = "Notifications were blocked";
        } else {
          this.canToggle = true;
          this.error = error.message ? error.message : error;
        }
      }).then(() => {
        this.isLoading = false;
      });
  }

  private setButtonText(pushIsEnabled : boolean) {
    this.buttonText = pushIsEnabled ? 'Disable' : 'Enable';
  }

}
