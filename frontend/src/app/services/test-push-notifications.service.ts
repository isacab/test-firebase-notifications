import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { PushRegistration } from '../models/push-registration';

@Injectable()
export class TestPushNotificationsService {

  private _receivedMessages : Array<any>;

  constructor(private api : ApiService) { 
    this.setServiceWorkerMessageListeners();
    this.updateAllReceived();
  }

  get receivedMessages() : Array<any> {
    return this._receivedMessages;
  }

  send(token : string) : Promise<any> {
    return this.api.sendPushNotification(token);
  }

  newTest() {
    // TODO call api to start new test
  }

  clearTest() {
    // Send api call to stop test

    // Notify service worker to clear receivedMessages
    return new Promise((resolve, reject) => {
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
        // Create a Message Channel
        var channel = new MessageChannel();

        // Handler for recieving message reply from service worker
        channel.port1.onmessage = onresponse;

        // Send message to service worker along with port for reply
        navigator.serviceWorker.controller.postMessage(message, [channel.port2]);
    }
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

        if(messageType === 'getAll' || messageType === 'push') {
          this._receivedMessages = event.data.allReceived;
        }
      });
    } else {
      console.log("Support for service workers are needed for this test to work.");
    }
  }

}
