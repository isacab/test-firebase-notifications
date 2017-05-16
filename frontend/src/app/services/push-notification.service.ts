import { Injectable, Inject } from '@angular/core';

import { FirebaseApp } from "angularfire2";
import * as firebase from 'firebase';

import 'rxjs/add/operator/toPromise';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';

import { IPair } from '../interfaces';
import { ApiService } from './api.service';

import { PushRegistration } from '../models/push-registration';

import { Helpers } from '../helpers';
import { PushNotAvailableError } from '../errors';

declare var Notification: any;
declare var navigator: any;

@Injectable()
export class PushNotificationService {
  
  private readonly messaging: firebase.messaging.Messaging;
  private readonly storeName = 'push_notifications';
  
  private pushRegistration : PushRegistration;

  constructor(@Inject(FirebaseApp) private firebaseApp: firebase.app.App, private api : ApiService) { 
    this.messaging = firebaseApp.messaging();
  }

  // [start] Observable properties

  // isSetUp - observable property
  private isInitializedSource : BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isInitializedChanged = this.isInitializedSource.asObservable();
  get isInitialized() : boolean {
    return this.isInitializedSource.getValue();
  }
  private setIsInitialized(value : boolean) : void {
    this.setValue(this.isInitializedSource, value);
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
   * Initialize the service
   */
  initialize() : Promise<any> {
    // Register the service worker
    return this.checkAvailable()
      .then(() => this.registerServiceWorker())
      .then((swReg : ServiceWorkerRegistration) => {
          // for debugging
          swReg.pushManager.getSubscription().then((subscription) => {
            console.log("subscription", subscription);
          });
      })
      .then(() => this.getToken())
      .then((token) => this.loadPushRegistration(token))
      .then(() => {
        this.setMessagingEventHandlers();
        if(this.pushRegistration) {
          this.setIsEnabled(this.pushRegistration.enabled);
        }
        this.setIsInitialized(true);
      })
      .catch((error) => {

        if(error !== null && typeof error === 'object') {
          if(error.name === PushNotAvailableError.name 
            && error.code === PushNotAvailableError.Blocked) {
              //blocked
              console.log("blocked");
          }
        }
        console.log(error);
        throw error;
      });
  }

  loadPushRegistration(token : string) : Promise<PushRegistration> {
    return new Promise<PushRegistration>((resolve, reject) => {
      if(!token) {
        resolve(null);
      }

      if(!this.getTokenSentToServer()) {
        this.sendToServer(null);
      }

      this.api.getPushRegistration(token)
        .then((reg : PushRegistration) => {
          this.pushRegistration = reg;
          resolve(reg);
        });
    });
  }

  /**
   * Check if push notifications are supported by the browser.
   * Returns a promise that resolves if they are available or rejects if not available.
   */
  checkAvailable() : Promise<any> {
    let promise = new Promise<boolean>((resolve, reject) => {
      
      if (!('serviceWorker' in navigator)) {
        reject(new PushNotAvailableError("Service Worker isn't supported on this browser."));
      }

      if (!('PushManager' in window)) {
        reject(new PushNotAvailableError("Push isn't supported on this browser."));
      }

      this.getNotificationPermissionState()
        .then(function(state: string) {
          if(state === 'denied') {
            reject(new PushNotAvailableError("Notifications are blocked by the browser."));
          }
          // Push notifications is available
          resolve();
        });
    });

    return promise;
  }

  /**
   * Enable or disable push notifications.
   * 
   * @param value 
   */
  setEnabled(value : boolean) : Promise<any> {
    let promise : Promise<any>;

    // Check if push is already enabled
    if(this.isEnabledSource.value === value) {
      promise = new Promise((resolve, reject) => { resolve(); });
    }
    else if(value) {
      promise = this.enable();
    }
    else {
      promise = this.disable();
    }

    return promise;
  }

  /**
   * Make the client able to receive push notifications
   * This function does following:
   *    1. request permission
   *    2. get token
   *    3. if succeed, set isPushEnabled = true
   */
  private enable() : Promise<any> {
    // Request permission, get token and on success, set isPushEnabled to true
    let promise = new Promise((resolve, reject) => {
      this.requestPermission()
        .then(() => this.getToken()) // get current token
        .then((currentToken) => {

          let oldToken = this.pushRegistration ? this.pushRegistration.token : undefined;

          let data = new PushRegistration({
            token: currentToken,
            enabled: true
          });

          return this.sendToServer(data, oldToken);
        })
        .then((reg : PushRegistration) => {
          this.pushRegistration = reg;

          this.setIsEnabled(true);
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
    return promise;
  }

  private disable() : Promise<any> {
    const currentToken = this.pushRegistration.token;
    const data = new PushRegistration({
      token: currentToken,
      enabled: false
    });
    
    let promise = this.sendToServer(data, currentToken)
      .then((reg : PushRegistration) => {
        this.pushRegistration = reg;

        this.setIsEnabled(false);
      })
      .catch(function(err) {
        throw err;
      });

    return promise;
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
                let data = new PushRegistration({
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

  private setTokenSentToServer(value: boolean) : void {
    localStorage.setItem('tokenSentToServer', value.toString());
  }

  private getTokenSentToServer() : boolean {
    let str = localStorage.getItem('tokenSentToServer');
    return JSON.parse(str);
  }

  private setLocalToken(value: string) : void {
    localStorage.setItem('token', value.toString());
  }

  private getLocalToken() : string {
    return localStorage.getItem('token');
  }

  private setLocalEnabled(value: boolean) : void {
    localStorage.setItem('enabled', value.toString());
  }

  private getLocalEnabled() : boolean {
    let str = localStorage.getItem('enabled');
    return JSON.parse(str);
  }

  private sendToServer(data : PushRegistration, oldToken? : string) : Promise<PushRegistration> {
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
