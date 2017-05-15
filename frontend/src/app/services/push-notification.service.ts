import { Injectable, Inject } from '@angular/core';

import { FirebaseApp } from "angularfire2";
import * as firebase from 'firebase';

//import { AngularIndexedDB } from 'angular2-indexeddb';

import 'rxjs/add/operator/toPromise';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';

import { IPair } from '../interfaces';
import { IndexedDBService } from './indexed-db.service';
import { ApiService } from './api.service';

import { PushRegistration } from '../models/push-registration';

declare var Notification: any;
declare var navigator: any;

export class PushNotificationDataToServer {
  token: string;
  enabled: boolean;
  
  constructor(init?:Partial<PushNotificationDataToServer>) {
    Object.assign(this, init);
  }
}

@Injectable()
export class PushNotificationService {
  
  private readonly messaging: firebase.messaging.Messaging;
  private readonly storeName = 'push_notifications';
  
  private pushRegistration : PushRegistration;

  constructor(@Inject(FirebaseApp) private firebaseApp: firebase.app.App, private api : ApiService, private db: IndexedDBService) { 
    let self = this;
    if(this.isSuported()) {
        this.messaging = firebaseApp.messaging();
        this.getNotificationPermissionState().then(function(state: string) {
            if(state !== 'denied') {
              self.setUpPush();
            }
          });
    }
  }

  // [start] Observable properties

  // isSetUp - observable property
  private isSetUpSource : BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isSetUpChanged = this.isSetUpSource.asObservable();
  get isSetUp() : boolean {
    return this.isSetUpSource.getValue();
  }
  private setIsSetUp(value : boolean) : void {
    this.setValue(this.isSetUpSource, value);
  }

  // isEnabled - observable property
  private isEnabledSource : BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isEnabledChanged = this.isEnabledSource.asObservable();
  get isEnabled() : boolean {
    return this.isEnabledSource.getValue();
  }
  private setIsEnabled(value : boolean) : void {
    this.setValue(this.isEnabledSource, value);
  }

  // canEnable - observable property
  private canEnableSource : BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  canEnableChanged = this.isEnabledSource.asObservable();
  get canEnable() : boolean {
    return this.canEnableSource.getValue();
  }
  private setCanEnable(value : boolean) : void {
    this.setValue(this.canEnableSource, value);
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

  /**
   * Check if push notifications are supported by the browser.
   */
  private isSuported() : boolean {
    if (!('serviceWorker' in navigator)) {
        console.log("Service Worker isn't supported on this browser.");
        return false;
    }

    if (!('PushManager' in window)) {
        console.log("Push isn't supported on this browser.");
        return false;
    }

    return true;
  }

  /**
   * Enable or disable push notifications.
   * 
   * @param value 
   */
  setEnabled(value : boolean) : firebase.Promise<any> {
    // Check if push is already enabled
    if(this.isEnabledSource.value === value)
      return new Promise((resolve, reject) => { resolve(); });

    if(value) {
      return this.enable();
    }
    else {
      return this.disable();
    }
  }

  /**
   * Make the client able to receive push notifications
   * This function does following:
   *    1. request permission
   *    2. get token
   *    3. if succeed, set isPushEnabled = true
   */
  private enable() : firebase.Promise<any> {
    // Request permission, get token and on success, set isPushEnabled to true
    return this.requestPermission()
            .then(this.getToken) // get current token
            .then((currentToken) => {

              let oldToken = this.pushRegistration.token;
              let data = new PushNotificationDataToServer({
                token: currentToken,
                enabled: true
              });

              return this.sendToServer(data, oldToken);
            })
            .then((reg : PushRegistration) => {
              this.pushRegistration = reg;

              this.setIsEnabled(true);
            })
            .catch(function(err) {
              throw err;
            });
  }

  private disable() : firebase.Promise<any> {
    const currentToken = this.pushRegistration.token;
    const data = new PushNotificationDataToServer({
      token: currentToken,
      enabled: false
    });
    
    return this.sendToServer(data, currentToken)
            .then((reg : PushRegistration) => {
              this.pushRegistration = reg;

              this.setIsEnabled(false);
            })
            .catch(function(err) {
              throw err;
            });
  }

  /**
   * Register the service worker and set up message handlers
   */
  private setUpPush() {
    // Register the service worker
    this.registerServiceWorker().then((swReg : ServiceWorkerRegistration) => {
        swReg.pushManager.getSubscription().then((subscription) => {
            console.log("subscription", subscription);
            
            this.getToken().then((token) => {
              if(token) {
                this.api.getPushRegistration(token).then((reg : PushRegistration) => {
                  this.pushRegistration = reg;
                  this.setMessagingEventHandlers();
                  this.setCanEnable(true);
                  this.setIsSetUp(true);
                });
              }
            });
        }).catch((error) => {
            console.error('Could not setup push,', error);
        });
    });
  }

  private registerServiceWorker() : Promise<ServiceWorkerRegistration> {
    return navigator.serviceWorker.register('sw.js')
        .then((swReg) => {
            console.log('Service Worker is registered', swReg);

            this.messaging.useServiceWorker(swReg);

            return swReg;
        })
        .catch((error) => {
            console.error('Service Worker Error', error);
            throw error;
        });
  }

  private setMessagingEventHandlers() : void {
    // Callback fired if Instance ID token is updated.
    this.messaging.onTokenRefresh(() => {
        console.log('Token refreshed.');
        this.messaging.getToken()
            .then((refreshedToken) => {
                let oldToken = this.pushRegistration.token;
                this.setTokenSentToServer(false);
                console.log('Current token: ' + refreshedToken);
                let data = new PushNotificationDataToServer({
                  token: refreshedToken,
                  enabled: this.pushRegistration.enabled
                });
                this.sendToServer(data, oldToken);
                this.pushRegistration.token = refreshedToken;
                console.log('Refreshed token: ' + refreshedToken);
            })
            .catch(function (err) {
                console.log('Unable to retrieve refreshed token ', err);
            });
    });

    // Handle incoming messages. Called when:
    // - a message is received while the app has focus
    // - the user clicks on an app notification created by a sevice worker
    //   `messaging.setBackgroundMessageHandler` handler.
    this.messaging.onMessage(function (payload) {
        console.log("Message received. ", payload);
    });
  }

  private getToken() : firebase.Promise<any> {
    // Get Instance ID token. The first call to this method makes a network call, once retrieved
    // subsequent calls to getToken will return from cache (if the token is not deleted).
    return this.messaging.getToken()
        .then((currentToken) => {
          return currentToken;
        })
        .catch((err) => {
          console.log('An error occurred while retrieving token. ', err);
          //showToken('Error retrieving Instance ID token. ', err);
          this.setTokenSentToServer(false);
          throw err;
        });
  }

  /** 
   * Request permission for push notifications.
   */
  private requestPermission() : firebase.Promise<any> {
    return this.messaging.requestPermission()
        .then(function () {
            console.log('Notification permission granted.');
        })
        .catch(function (err) {
            console.log('Unable to get permission for notifications.', err);
            throw err;
        });
  }

  /*private getValueFromIndexedDB(key : string, defaultValue? : any) {
    return new Promise<boolean>((resolve, reject) => {
      this.db.get(this.storeName, key, defaultValue)
        .then((result) => {
          resolve(result.value);
        },
        (error) => {
          reject(error);
        });
    });
  }

  private putValueInIndexedDB(key : string, value: any) : Promise<string> {
    let data : IPair = { 'key': key, 'value': value };
    return this.db.put(this.storeName, data);
  }*/

  private setTokenSentToServer(value: boolean) : void {
    localStorage.setItem('tokenSentToServer', value.toString());
  }

  private getTokenSentToServer() : boolean {
    let str = localStorage.getItem('tokenSentToServer');
    return JSON.parse(str);
  }

  private sendToServer(data : PushNotificationDataToServer, oldToken? : string) : Promise<PushRegistration> {
    let request : Promise<PushRegistration>;

    if(oldToken) {
      request = this.api.updatePushRegistration(oldToken, data);
    }
    else {
      request = this.api.createPushRegistration(data);
    }

    return request.then((result) => { 
      // ok
      this.setTokenSentToServer(true);
      return result;
    }, (error) => {
      // nok 
      Promise.reject(error);
    });
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
