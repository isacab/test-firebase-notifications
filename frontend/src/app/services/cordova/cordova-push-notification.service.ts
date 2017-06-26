import { Injectable } from '@angular/core';

import 'rxjs/add/operator/toPromise';
import { Observable, ReplaySubject, BehaviorSubject, Subject } from 'rxjs';

import { PushNotificationService } from "app/services/push-notification.service";
import { ApiService } from "app/services/api.service";

import { environment } from "environments/environment";
import { WindowRefService } from "app/services/window-ref.service";

@Injectable()
export class CordovaPushNotificationService /*extends PushNotificationService*/ {

  constructor(api : ApiService, private windowRef : WindowRefService) {
    //super(api);
  }

  private get firebasePlugin() {
    return (<any>window).FirebasePlugin;
  }

  checkAvailable(): Promise<any> {
    if(this.platform() === 'android' || this.platform() === 'ios')
      return Promise.resolve();

    return Promise.reject(new Error("App is not running on android or ios"));
  }

  protected getToken(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.firebasePlugin.getToken((token) => {
        resolve(token);
      }, (err) => {
        reject(err);
      });
    });
  }

  protected onMessage(callback: Object) {
    this.firebasePlugin.onMessage(callback);
  }

  protected onTokenRefresh(callback: Object) {
    this.firebasePlugin.onTokenRefresh(callback);
  }
    
  protected requestPermission(): Promise<any> {
    if(this.platform() === 'android')
      return Promise.resolve();

    return new Promise((resolve, reject) => {
      this.firebasePlugin.grantPermission(
        () => resolve,
        () => reject)
    });
  }

  protected platform() : string {
    let cordova = this.windowRef.nativeWindow.cordova;
    return cordova ? cordova.platform : "browser";
  }

}
