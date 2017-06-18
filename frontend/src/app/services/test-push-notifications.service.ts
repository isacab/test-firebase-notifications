import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { PushNotificationService } from './push-notification.service';
import { PushRegistration } from '../models/push-registration';
import { Test } from '../models/test';
import { NotificationData } from "../models/notification-data";

import { Observable, ReplaySubject, BehaviorSubject } from 'rxjs';

@Injectable()
export class TestPushNotificationsService {

  private _receivedNotifications : Array<NotificationData> = [];

  constructor(private api : ApiService, private pushService : PushNotificationService) { 
    if(pushService.isInitialized) {
      this.setServiceWorkerMessageListeners();
    } else {
      pushService.isInitializedChanged.subscribe(() => {
        this.setServiceWorkerMessageListeners();
      });
    }
  }

  get receivedMessages() : Array<any> {
    return this._receivedNotifications;
  }

  // [start] Observable properties

  // currentTest - observable property
  private _currentTestSource : BehaviorSubject<Test> = new BehaviorSubject<Test>(null);
  readonly currentTestChanged = this._currentTestSource.asObservable();
  get currentTest() : Test {
    return this._currentTestSource.getValue();
  }
  private setCurrentTest(value : Test) : void {
    this.setValue(this._currentTestSource, value);
  }

  // [end] Observable properties

  /**
   * set value for an BehaviorSubject
   */ 
  private setValue<T>(subject : BehaviorSubject<T>, value : T) : void {
    if(subject.getValue() !== value) {
      subject.next(value);
    }
  }

  loadTest(id : number) : Promise<Test> {
    // Send api call to get test
    return this.api.getTest(id)
      .then((testFromServer : Test) => {
        this.updateNotificationList(testFromServer);
        this.setCurrentTest(testFromServer);
        return testFromServer;
      });
  }

  private updateNotificationList(test : Test) : void {
    /*if(!test || !test.notifications)
      return;
    let arr : Array<NotificationData> = [];
    this.receivedMessages.forEach((element : NotificationData) => {
      if(element.testId === test.id && test.notifications.some() {
        arr.push()
      }
    });*/
  }

  startTest(token : string, test : Test) : Promise<any> {
    // Send api call to start test
    return this.api.startTest(token, test)
      .then((testFromServer : Test) => {
        this.updateNotificationList(testFromServer);
        this._receivedNotifications = [];
        this.setCurrentTest(testFromServer);
        return testFromServer;
      });
  }

  stopTest(token : string) {
    let test = this.currentTest;

    if(!test || test.running)
      throw new Error("No test to stop");

    // Send api call to stop test
    return this.api.stopTest(test.id)
      .then((testFromServer : Test) => {
        this.setCurrentTest(testFromServer);
        return testFromServer;
      });
  }

  private setServiceWorkerMessageListeners() {
    if('serviceWorker' in navigator){
      // Handler for messages coming from the service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if(!(event.data && event.data.messageType)) {
          return;
        }
        
        console.log("[setServiceWorkerMessageListeners] Received data: ", event.data);

        let messageType = event.data.messageType;

        if(messageType === 'notification') {
          let received = new NotificationData(event.data.received);
          let test = this.currentTest;

          this._receivedNotifications.push(received);

          if(test && received.testId === test.id) {
            if(!test.notifications)
              test.notifications = [];
            test.notifications.push(received);
          }
        }
      });
    } else {
      console.log("Support for service workers are needed for this test to work.");
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
