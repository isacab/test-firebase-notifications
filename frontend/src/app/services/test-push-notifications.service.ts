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

  send(token : string) {
    this.api.sendPushNotification(token);
  }

  newTest() {
    // TODO call api to start new test
  }

  updateAllReceived() {
    if('serviceWorker' in navigator){
      // Handler for messages coming from the service worker
      return new Promise((resolve, reject) => {
        // Create a Message Channel
        var channel = new MessageChannel();

        // Handler for recieving message reply from service worker
        channel.port1.onmessage = (event) => {
          if(event.data.error) {
            reject(new Error("Could not update all received messages from service worker, Error: " + event.data.error));
          } else {
            console.log("[updateAllReceived] Received data: ", event.data);
            this._receivedMessages = event.data.allReceived;
            resolve(event.data);
          }
        };

        // Send message to service worker along with port for reply
        navigator.serviceWorker.controller.postMessage("getAll", [channel.port2]);
      });
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
