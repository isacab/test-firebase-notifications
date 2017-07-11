import { Component, OnInit, Inject } from '@angular/core';
import { PushNotificationService } from "app/services/push-notification.service";
import { Helper } from "app/helper";

@Component({
  selector: 'enable-push',
  templateUrl: './enable-push.component.html',
  styleUrls: ['./enable-push.component.css']
})
export class EnablePushComponent implements OnInit {

  isEnabling : boolean;
  isEnabled : boolean;
  isAvailable : boolean;
  error : string;

  constructor(
    @Inject('PushNotificationService') private pushService : PushNotificationService,
    private helper : Helper
  ) { }

  ngOnInit() {
    this.pushService.tokenChanged.subscribe((token : string) => {
      this.isEnabled = !!token;
    });

    this.pushService.checkAvailable().then(() => {
      this.isAvailable = true;
    }).catch((err) => {
      this.isAvailable = false;
    });
  }

  enablePush() {
    if(!this.canEnable)
      return;

    this.isEnabling = true;
    this.pushService.register()
      .then(() => {
        this.error = '';
      }).catch((err : Error) => {
        this.error = this.helper.errorMessage(err);
      }).then(() => {
        this.isEnabling = false;
      });
  }

  get canEnable() : boolean {
    return this.isAvailable && !this.isEnabled;
  }

}
