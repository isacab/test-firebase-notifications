import { Injectable, Inject, NgZone } from '@angular/core';
import { ApiService } from "app/services/api.service";
import { TestService } from "app/services/test.service";
import { PushNotificationService } from "app/services/push-notification.service";
import { NotificationData } from "app/models/notification-data";
import { Test } from "app/models/test";

@Injectable()
export class CordovaTestService extends TestService {

  private readonly maxNumRetries = 10;
  private readonly maxBackOff = 60000;

  constructor(
    api : ApiService, 
    ngZone: NgZone,
    @Inject('PushNotificationService') pushService : PushNotificationService
  ) {
    super(api, ngZone, pushService);
    this.setNotificationListener();
  }

  start(token : string, test : Test) : Promise<Test> {
    return super.start(token, test).then((test : Test) => {
      (<any>window).plugins.insomnia.keepAwake();
      return test;
    });
  }

  stop() : Promise<Test> {
    return super.stop().then((test : Test) => {
      (<any>window).plugins.insomnia.allowSleepAgain();
      return test;
    });
  }

  private setNotificationListener() {
    this.pushService.onNotificationReceived.subscribe((payload) => {
      //payload = payload.data;
      let receivedClient = new Date().getTime();
      let notificationData = new NotificationData();
      notificationData.id = +payload.id;
      notificationData.sequenceNumber = +payload.sequenceNumber;
      notificationData.received = +payload.received;
      notificationData.clientToServerRTT = +payload.clientToServerRTT;
      notificationData.sent = +payload.sent;
      notificationData.testId = +payload.testId;
      notificationData.obsolete = 
        typeof(payload.obsolete) == 'string' ? String(payload.obsolete).toLowerCase() == 'true' : !!payload.obsolete;

      //console.log("[CordovaTestService] Received message: " + JSON.stringify(notificationData));

      this.stopTimer(notificationData).then((dataFromServer) => {
        //console.log("[CordovaTestService] Stoped timer: " + JSON.stringify(dataFromServer));
        this.onReceivedNotification(dataFromServer);
      }).catch((error) => {
        //console.log("[CordovaTestService] Could not stop timer for notification.", notificationData);
      });
    });
  }

  private stopTimer(notificationData : NotificationData, retryAttempt : number = 0) : Promise<NotificationData> {
    return this.api.stopTimer(notificationData)
      .catch((error) => {
        console.log('[cordova-test.service.js] Could not notify server, retryAttempt: ' + retryAttempt + ', reason: ' + error);
        notificationData.obsolete = true;
        if(retryAttempt < this.maxNumRetries) {
          // retry using exponential backoff
          var backoff = this.getBackOff(++retryAttempt, this.maxBackOff);
          return this.delay(backoff).then(() => {
              return this.stopTimer(notificationData, retryAttempt);
          });
        }
        console.error('[cordova-test.service.js] All retry attempts made for notification: ' + JSON.stringify(notificationData));
        return Promise.reject(error);
      })
      .then((data) => {
        return this.sendRttToServer(data);
      });
  }

  private sendRttToServer(notificationData : NotificationData, retryAttempt : number = 0) : Promise<NotificationData> {
    return this.api.updateNotification(notificationData)
      .catch((error) => {
        console.log('[cordova-test.service.js] Could not send rtt to server, retryAttempt: ' + retryAttempt + ', reason: ' + error);
        notificationData.obsolete = true;
        if(retryAttempt < this.maxNumRetries) {
          // retry using exponential backoff
          var backoff = this.getBackOff(++retryAttempt, this.maxBackOff);
          return this.delay(backoff).then(() => {
              return this.stopTimer(notificationData, retryAttempt);
          });
        }
        console.error('[cordova-test.service.js] All retry attempts made for rtt: ' + JSON.stringify(notificationData));
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

}
