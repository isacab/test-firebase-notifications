import { Injectable, Inject } from '@angular/core';

import { FirebaseApp } from "angularfire2";
import * as firebase from 'firebase';

import 'rxjs/add/operator/toPromise';
import { Observable, ReplaySubject, BehaviorSubject, Subject } from 'rxjs';

import { PushNotificationService } from "app/services/push-notification.service";
import { ApiService } from "app/services/api.service";

import { PushRegistration } from "app/models/push-registration";

declare var Notification: any;
declare var navigator: any;

@Injectable()
export class WebPushNotificationService extends PushNotificationService {

  private readonly serviceWorkerFile = "sw.js";

  constructor(@Inject(FirebaseApp) private firebaseApp: firebase.app.App, api : ApiService) { 
    super(api);
  }

  private get _messaging() : firebase.messaging.Messaging {
    let m = this.firebaseApp.messaging();
    return m;
  }

  /**
   * Check if push notifications are supported by the browser.
   * Returns a promise that resolves if they are available or rejects if not available.
   * There is no data passed on resolve.
   */
  checkAvailable() : Promise<any> {
    return new Promise<any>((resolve, reject) => {
      
      if (!('serviceWorker' in navigator)) {
        reject(new Error("Service Worker is not supported in this browser."));
        return;
      }

      if (!('PushManager' in window)) {
        reject(new Error("Push is not supported in this browser."));
        return;
      }

      this.getNotificationPermissionState()
        .then(function(state: string) {
          if(state === 'denied') {
            reject(new Error("Notifications are blocked by the browser."));
            return;
          }
          // Push notifications is available
          resolve();
        });
    });
  }

  loadPushRegistration() : Promise<PushRegistration> {
    return this.registerServiceWorker().then(() => super.loadPushRegistration());
  }

  /**
   * Register the service worker used to receive push notifications.
   * The notifications received when application is in background or closed are handled by the service worker.
   */
  private registerServiceWorker() : Promise<ServiceWorkerRegistration> {
    return navigator.serviceWorker.register(this.serviceWorkerFile)
        .then((swReg) => {
            console.log('Service Worker is registered', swReg);

            // Set firebase messaging to use the registrated service worker
            this._messaging.useServiceWorker(swReg);

            return swReg;
        })
        .catch((error) => {
            console.error('Service Worker Error', error);
            throw error;
        });
  }

  /**
   * Get Instance ID token. The first call to this method makes a network call, once retrieved
   * subsequent calls to getToken will return from cache (if the token has not been deleted in between).
   */
  protected getToken() : Promise<any> {
    return new Promise((resolve, reject) => {
      this._messaging.getToken().then((currentToken) => {
        resolve(currentToken);
      })
      .catch((err) => {
        console.log('An error occurred while retrieving token. ', err);
        reject(err);
      })
    });
  }

  /** 
   * Request permission for push notifications. 
   * If the browser permission state is 'prompt', the user is asked to Allow or Block notifications.
   * Returns a promise that resolves if permission could be granted and rejects if not.
   */
  protected requestPermission() : Promise<any> {
    return new Promise((resolve, reject) => {
      this._messaging.requestPermission().then((currentToken) => {
        console.log('[web-push-notification.service] Notification permission granted.');
        resolve();
      })
      .catch((err) => {
        console.log('[web-push-notification.service] Unable to get permission for notifications.', err);
        reject(err);
      })
    });
  }

  protected onMessage(nextOrObserver: Object): void {
    this._messaging.onMessage(nextOrObserver);
  }

  protected onTokenRefresh(nextOrObserver: Object) : void {
    this._messaging.onTokenRefresh(nextOrObserver);
  }

  /**
   * This function uses the Permission API to get the permission state, falling back to Notification.permission if the Permission API is not supported. 
   * This is done for performance reasons. 
   * Calling Notification.permision locks up the main thread in Chrome and calling it repeatedly is a bad idea.
   * (Matt Gaunt, Web push book, page 8)
   */  
  private getNotificationPermissionState() : Promise<any> {
    if (navigator.permissions) {
      return navigator.permissions.query({name: 'notifications'})
        .then((result) => {
          return result.state;
        });
    }
    
    return new Promise((resolve) => {
      resolve(Notification.permission);
    });
  }

}
