import { Injectable } from '@angular/core';
import { Test } from '../models/test';
import { NotificationData } from "../models/notification-data";
import { Observable, Subject } from 'rxjs';

@Injectable()
export class ReceivedPushNotificationsService {

  readonly receivedHistory : Array<NotificationData> = [];

  private _receivedSubject = new Subject<NotificationData>();
  readonly received = this._receivedSubject.asObservable();

  constructor() { 
    this.setServiceWorkerMessageListeners();
  }

  private setServiceWorkerMessageListeners() {
    if('serviceWorker' in navigator){
      // Handler for messages coming from the service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if(!(event.data && event.data.messageType)) {
          return;
        }
        
        console.log("[received-push-notifications.service] Received data: ", event.data);

        let messageType = event.data.messageType;

        if(messageType === 'notification') {
          let notificationData = new NotificationData(event.data.notificationData);
          this.receivedHistory.push(notificationData);
          this._receivedSubject.next(notificationData);

          /*if(test && received.testId === test.id) {
            if(!test.notifications)
              test.notifications = [];
            test.notifications.push(received);
          }*/
        }
      });
    } else {
      console.log("[received-push-notifications.service] Service workers are not supported by browser.");
    }
  }

}
