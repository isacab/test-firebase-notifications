import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { PushNotificationService } from './push-notification.service';
import { PushRegistration } from '../models/push-registration';
import { Test } from '../models/test';

import { Observable, ReplaySubject, BehaviorSubject } from 'rxjs';

@Injectable()
export class TestPushNotificationsService {

  private _receivedMessages : Array<any>;

  private _test : Test;

  constructor(private api : ApiService, private pushService : PushNotificationService) { 
    if(pushService.isInitialized) {
      this.setServiceWorkerMessageListeners();
      this.updateAllReceived();
    } else {
      pushService.isInitializedChanged.subscribe(() => {
        this.setServiceWorkerMessageListeners();
        this.updateAllReceived();
      });
    } 

  }

  get receivedMessages() : Array<any> {
    return this._receivedMessages;
  }

  get currentTest() : Test {
    return this._test;
  }

  startTest(token : string, test : Test) : Promise<any> {
    // Notify service worker to clear receivedMessages
    let notifyServiceWorker = new Promise((resolve, reject) => {
      let message = "clear";
      let onresponse = (event) => {
        if(event.data.error) {
          reject(new Error("Could not update all received messages from service worker, Error: " + event.data.error));
        } else {
          // Clear receivedMessages
          console.log("[startTest] Response: ", event.data);
          this._receivedMessages = event.data.allReceived;
          resolve(event.data);
        }
      };
      this.sendMessageToServiceWorker(message, onresponse);
    });

    return notifyServiceWorker
      .then(() => this.api.startTest(token, test))
      .then(() => this._test = new Test(test));
  }

  clearTest(token : string) {
    // Notify service worker to clear receivedMessages
    let notifyServiceWorker = new Promise((resolve, reject) => {
      let message = "clear";
      let onresponse = (event) => {
        if(event.data.error) {
          reject(new Error("Could not update all received messages from service worker, Error: " + event.data.error));
        } else {
          // Clear receivedMessages
          console.log("[clearTest] Response: ", event.data);
          this._receivedMessages = event.data.allReceived;
          resolve(event.data);
        }
      };
      this.sendMessageToServiceWorker(message, onresponse);
    });

    // Send api call to stop test
    return this.api.stopTest(token).then(() => notifyServiceWorker);
  }

  updateAllReceived() {
    return new Promise((resolve, reject) => {
      let message = "getAll";
      let onresponse = (event) => {
        if(event.data.error) {
          reject(new Error("Could not update all received messages from service worker, Error: " + event.data.error));
        } else {
          console.log("[updateAllReceived] Received data: ", event.data);
          this._receivedMessages = event.data.allReceived;
          resolve(event.data);
        }
      };
      this.sendMessageToServiceWorker(message, onresponse);
    });
  }

  private sendMessageToServiceWorker(message : any, onresponse : (this: MessagePort, ev: MessageEvent) => any) {
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
  }

  setServiceWorkerMessageListeners() {
    if('serviceWorker' in navigator){
      // Handler for messages coming from the service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if(!(event.data && event.data.messageType)) {
          return;
        }
        
        console.log("[setServiceWorkerMessageListeners] Received data: ", event.data);

        let messageType = event.data.messageType;

        if(messageType === 'getAll' || messageType === 'push' || messageType === 'stopTimer') {
          this._receivedMessages = event.data.allReceived;
        }
      });
    } else {
      console.log("Support for service workers are needed for this test to work.");
    }
  }

}
