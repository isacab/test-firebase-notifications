import { Injectable, Inject } from '@angular/core';
import { ApiService } from "app/services/api.service";
import { TestService } from "app/services/test.service";
import { PushNotificationService } from "app/services/push-notification.service";
import { NotificationData } from "app/models/notification-data";

@Injectable()
export class CordovaTestService extends TestService {

  constructor(
    api : ApiService, 
    @Inject('PushNotificationService') pushService : PushNotificationService
  ) {
    super(api, pushService);
    this.setNotificationListener();
  }

  private setNotificationListener() {
    this.pushService.onNotificationReceived.subscribe((data : NotificationData) => {
      this.onReceivedNotification(data);
    })
  }

}
