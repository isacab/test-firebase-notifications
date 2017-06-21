import { Injectable, Inject } from '@angular/core';

import { TestService } from "app/services/test.service";
import { ApiService } from "app/services/api.service";
import { PushNotificationService } from "app/services/push-notification.service";

import { NotificationData } from "app/models/notification-data";
import { Test } from "app/models/test";

@Injectable()
export class WebTestService extends TestService {

  constructor(
    api : ApiService, 
    @Inject('PushNotificationService') pushService : PushNotificationService
  ) {
    super(api, pushService);
    this.setNotificationListener();
  }

  private setNotificationListener() {
    if('serviceWorker' in navigator) {
      // Handler for messages coming from the service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if(!(event.data && event.data.messageType))
          return;
      
        console.log("[web-test.service] Received data: ", event.data);

        let messageType = event.data.messageType;

        if(messageType === 'notification') {
          let notificationData = new NotificationData(event.data.notificationData);
          this.onReceivedNotification(notificationData);
        }
      });
    } else {
      console.error("[web-test.service] Service workers are not supported by browser.");
    }
  }

}
