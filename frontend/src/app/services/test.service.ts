import { Injectable, Inject, NgZone } from '@angular/core';
import { ApiService } from './api.service';
import { PushNotificationService } from './push-notification.service';
import { PushRegistration } from '../models/push-registration';
import { Test } from '../models/test';
import { NotificationData } from "../models/notification-data";

import { Observable, ReplaySubject, BehaviorSubject } from 'rxjs';
import { WebSocketSubject } from "rxjs/observable/dom/WebSocketSubject";

@Injectable()
export class TestService {

  private waitingForResponse : boolean;
  private receivedNotificationsWhileWaiting : Array<NotificationData> = [];
  private currentTestToken : string;

  private readonly maxNumRetries = 10;
  private readonly maxBackOff = 60000;

  constructor(
    protected api : ApiService, 
    protected ngZone: NgZone,
    @Inject('PushNotificationService') protected pushService : PushNotificationService
  ) { 
    this.setNotificationListener();
  }

  // [start] Observable properties

  // currentTest - observable property
  private _currentTestSource : BehaviorSubject<Test> = new BehaviorSubject<Test>(null);
  readonly currentTestChanged = this._currentTestSource.asObservable();
  get currentTest() : Test {
    return this._currentTestSource.getValue();
  }
  private setCurrentTest(value : Test) : void {
    this.ngZone.run(() => {
      this.setValue(this._currentTestSource, value);
    })
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
    this.startWaitingForResponse(token);
    return this.api.startTest(token, test)
      .then((test) => this.stopWaitingForResponse(test));
  }

  load(id : number, token : string) : Promise<Test> {
    let currentTest = this.currentTest;
    if(currentTest && currentTest.id === id)
      return Promise.resolve(currentTest);
      
    this.startWaitingForResponse(token);
    return this.api.getTest(id, token)
      .then((test) => this.stopWaitingForResponse(test));
  }

  stop() : Promise<Test> {
    return this.api.stopTest(this.currentTest.id, this.currentTestToken).then((test) => {
      this.setCurrentTest(test);
      return test;
    });
  }

  private startWaitingForResponse(token : string) {
    this.receivedNotificationsWhileWaiting = [];
    this.currentTestToken = token;
    this.waitingForResponse = true;
  }

  private stopWaitingForResponse(test : Test) {
      this.setCurrentTest(test);
      this.updateReceivedNotification(test, this.receivedNotificationsWhileWaiting);
      this.waitingForResponse = false;
      this.receivedNotificationsWhileWaiting = [];
      return test;
  }

  protected setNotificationListener() {
    this.pushService.onNotificationReceived.subscribe((data) => {
      let notificationData = new NotificationData();
      notificationData.id = +data.id;
      notificationData.sequenceNumber = +data.sequenceNumber;
      notificationData.receivedServer = +data.receivedServer;
      notificationData.receivedClient = +data.receivedClient;
      notificationData.sent = +data.sent;
      notificationData.testId = +data.testId;
      notificationData.failed = this.asBoolean(data.failed);
      notificationData.tap = this.asBoolean(data.tap);

      console.log("[CordovaTestService] Received message: " + JSON.stringify(data));

      this.stopTimer(notificationData).then((dataFromServer) => {
        //console.log("[CordovaTestService] Stoped timer: " + JSON.stringify(dataFromServer));
        this.onReceivedNotification(dataFromServer);
      }).catch((error) => {
        //console.log("[CordovaTestService] Could not stop timer for notification.", notificationData);
      });
    });
  }

  protected stopTimer(notificationData : NotificationData, retryAttempt : number = 0) : Promise<NotificationData> {
    notificationData.receivedClient = new Date().getTime();
    return this.api.stopTimer(notificationData)
      .catch((error) => {
        console.error('[cordova-test.service.js] Could not notify server, retryAttempt: ' + retryAttempt + ', reason: ' + error);
        notificationData.failed = true;
        if(retryAttempt < this.maxNumRetries) {
          // retry using exponential backoff
          var backoff = this.getBackOff(++retryAttempt, this.maxBackOff);
          return this.delay(backoff).then(() => {
              return this.stopTimer(notificationData, retryAttempt);
          });
        }
        console.error('[cordova-test.service.js] All retry attempts made for notification: ' + JSON.stringify(notificationData));
        return Promise.reject(error);
      });
  }

  private delay(t) : Promise<any> {
    return new Promise(function(resolve) { 
        setTimeout(resolve, t)
    });
  }

  private getBackOff(retryAttempt, maxBackOff) : number {
      let backoff = Math.pow(1.5, retryAttempt) * 1000;
      return Math.min(backoff, maxBackOff);
  }

  private asBoolean(value : any) : boolean {
    return typeof(value) == 'string' ? String(value).toLowerCase() == 'true' : !!value;
  }

  protected onReceivedNotification(notificationData : NotificationData) : void {
    let currentTest = this.currentTest;

    //console.log("[TestService] " + JSON.stringify(notificationData));

    if(currentTest && notificationData.testId === currentTest.id) {

      if(!currentTest.notifications) {
          currentTest.notifications = [];
      }

      //console.log("[TestService] push to notifications");

      currentTest.notifications.push(notificationData);
      this.setCurrentTest(new Test(currentTest));
    }

    if(this.waitingForResponse) {
      this.receivedNotificationsWhileWaiting.push(notificationData);
    }
  }

  protected updateReceivedNotification(test : Test, notifications : Array<NotificationData>) {
    notifications.forEach(element => {
      if(element.testId === test.id && !test.notifications.find(x => x.sequenceNumber == element.sequenceNumber)) {
        test.notifications.push(element);
      }
    });
  }
}
