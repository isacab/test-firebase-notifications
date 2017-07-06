import { Injectable, Inject, NgZone } from '@angular/core';

import { TestService } from "app/services/test.service";
import { ApiService } from "app/services/api.service";
import { PushNotificationService } from "app/services/push-notification.service";

import { NotificationData } from "app/models/notification-data";
import { Test } from "app/models/test";

@Injectable()
export class WebCustomSWTestService extends TestService {

  constructor(
    api : ApiService, 
    ngZone: NgZone,
    @Inject('PushNotificationService') pushService : PushNotificationService
  ) {
    super(api, ngZone, pushService);
  }

  protected setNotificationListener() {
    this.pushService.onNotificationReceived.subscribe((data) => {
      let notificationData = this.asNotificationData(data);
      this.onReceivedNotification(notificationData);
    });
  }

}
