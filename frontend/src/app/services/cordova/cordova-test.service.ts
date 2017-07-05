import { Injectable, Inject, NgZone } from '@angular/core';
import { ApiService } from "app/services/api.service";
import { TestService } from "app/services/test.service";
import { PushNotificationService } from "app/services/push-notification.service";
import { NotificationData } from "app/models/notification-data";
import { Test } from "app/models/test";

@Injectable()
export class CordovaTestService extends TestService {

  constructor(
    api : ApiService, 
    ngZone: NgZone,
    @Inject('PushNotificationService') pushService : PushNotificationService
  ) {
    super(api, ngZone, pushService);
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

}
