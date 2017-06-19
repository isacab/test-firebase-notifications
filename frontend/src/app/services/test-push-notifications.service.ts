import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { PushNotificationService } from './push-notification.service';
import { ReceivedPushNotificationsService } from './received-push-notifications.service';
import { PushRegistration } from '../models/push-registration';
import { Test } from '../models/test';
import { NotificationData } from "../models/notification-data";

import { Observable, ReplaySubject, BehaviorSubject } from 'rxjs';

@Injectable()
export class TestPushNotificationsService {

  private waitingForResponse : boolean;
  private receivedNotificationsWhileWaiting : Array<NotificationData> = [];

  constructor(
    private api : ApiService, 
    private pushService : PushNotificationService, 
    private receivedService : ReceivedPushNotificationsService
  ) { 
    this.setServiceWorkerMessageListener();
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

  start(token : string, test : Test) : Promise<Test> {
    this.startWaitingForResponse();
    return this.api.startTest(token, test)
      .then((test) => this.stopWaitingForResponse(test));
  }

  load(id : number) : Promise<Test> {
    let currentTest = this.currentTest;
    if(currentTest && currentTest.id)
      return Promise.resolve(currentTest);
      
    this.startWaitingForResponse();
    return this.api.getTest(id)
      .then((test) => this.stopWaitingForResponse(test));
  }

  stop() : Promise<Test> {
    return this.api.stopTest(this.currentTest.id).then((test) => {
      this.setCurrentTest(test);
      return test;
    });
  }

  private startWaitingForResponse() {
    this.receivedNotificationsWhileWaiting = [];
    this.waitingForResponse = true;
  }

  private stopWaitingForResponse(test : Test) {
      this.setCurrentTest(test);
      this.updateReceivedNotification(test, this.receivedNotificationsWhileWaiting);
      this.waitingForResponse = false;
      this.receivedNotificationsWhileWaiting = [];
      return test;
  }

  private setServiceWorkerMessageListener() {
    if('serviceWorker' in navigator){
      // Handler for messages coming from the service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if(!(event.data && event.data.messageType))
          return;
        
        console.log("[test-push-notifications.service] Received data: ", event.data);

        let messageType = event.data.messageType;

        if(messageType === 'notification') {
          let notificationData = new NotificationData(event.data.notificationData);
          this.onReceivedNotification(notificationData);
        }
      });
    } else {
      console.log("[test-push-notifications.service] Service workers are not supported by browser.");
    }
  }

  private onReceivedNotification(notificationData : NotificationData) : void {
    let currentTest = this.currentTest;

    if(currentTest && notificationData.testId === currentTest.id) {

      if(!currentTest.notifications) {
          currentTest.notifications = [];
      }

      currentTest.notifications.push(notificationData);
    }

    if(this.waitingForResponse) {
      this.receivedNotificationsWhileWaiting.push(notificationData);
    }
  }

  /*private setReceivedListener() {
    this.receivedService.received.subscribe(
      (notificationData : NotificationData) => {
        let currentTest = this.currentTest;
        if(notificationData.testId === currentTest.id) {
          
          if(!currentTest.notifications) {
              currentTest.notifications = [];
          }
          
          currentTest.notifications.push(notificationData);
        }
      }
    );
  }*/

  private updateReceivedNotification(test : Test, notifications : Array<NotificationData>) {
    notifications.forEach(element => {
      if(element.testId === test.id && !test.notifications.find(x => x.sequenceNumber == element.sequenceNumber)) {
        test.notifications.push(element);
      }
    });
  }
}
