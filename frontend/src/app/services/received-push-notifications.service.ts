import { Injectable } from '@angular/core';
import { Test } from '../models/test';
import { NotificationData } from "../models/notification-data";
import { Observable, Subject } from 'rxjs';

@Injectable()
export class ReceivedPushNotificationsService {

  receivedHistory : Array<NotificationData> = [];

  private _receivedSubject = new Subject<NotificationData>();
  readonly received = this._receivedSubject.asObservable();
  store : boolean = true;

  constructor() { 
    this.setServiceWorkerMessageListeners();
  }

  private setServiceWorkerMessageListeners() {
    if('serviceWorker' in navigator){
      // Handler for messages coming from the service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if(!this.store)
          return;

        if(!(event.data && event.data.messageType))
          return;
        
        console.log("[received-push-notifications.service] Received data: ", event.data);

        let messageType = event.data.messageType;

        if(messageType === 'notification') {
          let notificationData = new NotificationData(event.data.notificationData);
          this.receivedHistory.push(notificationData);
          this._receivedSubject.next(notificationData);
        }
      });
    } else {
      console.log("[received-push-notifications.service] Service workers are not supported by browser.");
    }
  }

  

  /*private sendMessageToServiceWorker(message : any, onresponse : (this: MessagePort, ev: MessageEvent) => any) {
    if('serviceWorker' in navigator){

      return navigator.serviceWorker.ready.then((reg) => { 
        
        console.log("controller", navigator.serviceWorker.controller);

        navigator.serviceWorker.addEventListener("controllerchange", () => {
          console.log("controller ready", navigator.serviceWorker.controller);
        });


        if(navigator.serviceWorker.controller) {
          // Create a Message Channel
          var channel = new MessageChannel();

          // Handler for recieving message reply from service worker
          channel.port1.onmessage = onresponse;

          // Send message to service worker along with port for reply
          navigator.serviceWorker.controller.postMessage(message, [channel.port2]);
        } else {
          return Promise.reject(new Error("Controller is not available in service worker"));
        }
      });
    }
    return Promise.reject(new Error("Service worker is not available"));
  }*/

}
