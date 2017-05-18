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
  
  private readonly _messaging: firebase.messaging.Messaging;
  
  private _pushRegistration : PushRegistration;

  constructor(@Inject(FirebaseApp) private firebaseApp: firebase.app.App, private api : ApiService) { 
    this._messaging = firebaseApp.messaging();
  }

  // [start] Observable properties

  // isInitialized - observable property
  private _isInitializedSource : BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isInitializedChanged = this._isInitializedSource.asObservable();
  get isInitialized() : boolean {
    return this._isInitializedSource.getValue();
  }
  private setIsInitialized(value : boolean) : void {
    this.setValue(this._isInitializedSource, value);
  }

  // [end] Observable properties

  /**
   * Get a copy of the push registration. 
   * Note: If no push registration is set a default registration will be returned.
   */
  getPushRegistration() : PushRegistration {
    return new PushRegistration(this._pushRegistration);
  }

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
      .then(() => this.setMessagingEventHandlers())
      .then(() => {
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
        throw error;
      });
  }

  /**
   * This method sets pushRegistration to the current push registration on the server.
   * This method also updates the token if a new token has not been sent to the server yet.
   * 
   * @param token Current registration token generated from messaging.getToken()
   */
  private loadPushRegistration(token : string) : Promise<PushRegistration> {
    return new Promise<PushRegistration>((resolve, reject) => {
      if(!token) {
        // No token, nothing to load
        resolve(undefined);
        return;
      }

      // Get the last token sent to the server from local storage
      let lastSentToken = this.getLocalToken();

      if(!lastSentToken) {
        // No token has been sent to the server which means there is no push registration to load from server.
        resolve(undefined);
        return;
      }

      // Check if we have a token that has not been sent to the server yet
      if(lastSentToken !== token) {
        // Get current push registration at the server
        this.api.getPushRegistration(lastSentToken)
          .then((reg : PushRegistration) => {
            // Update the push registration with the current token
            reg.token = token;
            return this.sendToServer(reg, lastSentToken);
          })
          .then((reg : PushRegistration) => {
            // Push registration has been updated
            this._pushRegistration = reg;
            resolve(reg);
          })
          .catch((error) => {
            reject(new Error("Could not load registration token."));
          });
      } 
      else{
        // Get current push registration at the server
        this.api.getPushRegistration(token)
          .then((reg : PushRegistration) => {
            this._pushRegistration = reg;
            resolve(reg);
          })
          .catch((error) => {
            reject(new Error("Could not load registration token."));
          });
      }
      
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
        return;
      }

      if (!('PushManager' in window)) {
        reject(new PushNotAvailableError("Push isn't supported on this browser."));
        return;
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

    let enabled = this._pushRegistration ? this._pushRegistration.enabled : false;

    // Check if push is already enabled
    if(enabled === value) {
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
   * Private helper method to setEnabled. This method enables push notifications.
   */
  private enable() : Promise<any> {
    // Request permission, get token and on success, set isPushEnabled to true
    let promise = new Promise((resolve, reject) => {
      this.requestPermission()
        .then(() => this.getToken()) // get current token
        .then((currentToken) => {

          let oldToken = this._pushRegistration ? this._pushRegistration.token : undefined;

          let data = new PushRegistration({
            token: currentToken,
            enabled: true
          });

          return this.sendToServer(data, oldToken);
        })
        .then((reg : PushRegistration) => {
          this._pushRegistration = reg;
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
    return promise;
  }

  /**
   * Private helper method to setEnabled. This method disables push notifications.
   */
  private disable() : Promise<any> {
    const currentToken = this._pushRegistration.token;
    const data = new PushRegistration({
      token: currentToken,
      enabled: false
    });
    
    let promise = this.sendToServer(data, currentToken)
      .then((reg : PushRegistration) => {
        this._pushRegistration = reg;
      })
      .catch(function(err) {
        throw err;
      });

    return promise;
  }

  /**
   * Register the service worker used to receive push notifications.
   */
  private registerServiceWorker() : Promise<ServiceWorkerRegistration> {
    return navigator.serviceWorker.register('sw.js')
        .then((swReg) => {
            console.log('Service Worker is registered', swReg);

            this._messaging.useServiceWorker(swReg);

            return swReg;
        })
        .catch((error) => {
            console.error('Service Worker Error', error);
            throw error;
        });
  }

  private setMessagingEventHandlers() : void {
    let messaging = this._messaging;
    // Callback fired if Instance ID token is updated.
    messaging.onTokenRefresh(() => {
        console.log('Token refreshed.');
        messaging.getToken()
            .then((refreshedToken) => {
                let oldToken = this._pushRegistration.token;
                let data = new PushRegistration({
                  token: refreshedToken,
                  enabled: this._pushRegistration.enabled
                });
                return this.sendToServer(data, oldToken);
            })
            .then((reg : PushRegistration) => {
                console.log('Refreshed token: ' + reg.token);
            })
            .catch(function (err) {
                console.log('Unable to retrieve refreshed token ', err);
            });
    });

    // Handle incoming messages. Called when:
    // - a message is received while the app has focus
    // - the user clicks on an app notification created by a sevice worker
    //   `messaging.setBackgroundMessageHandler` handler.
    messaging.onMessage(function (payload) {
        console.log("Message received. ", payload);
    });
  }

  /**
   * Get Instance ID token. The first call to this method makes a network call, once retrieved
   * subsequent calls to getToken will return from cache (if the token is not deleted).
   */
  private getToken() : firebase.Promise<any> {
    return this._messaging.getToken().then((currentToken) => {
        return currentToken;
      })
      .catch((err) => {
        console.log('An error occurred while retrieving token. ', err);
        throw err;
      });
  }

  /** 
   * Request permission for push notifications.
   */
  private requestPermission() : firebase.Promise<any> {
    return this._messaging.requestPermission()
        .then(function () {
            console.log('Notification permission granted.');
        })
        .catch(function (err) {
            console.log('Unable to get permission for notifications.', err);
            throw err;
        });
  }

  private setLocalToken(value: string) : void {
    localStorage.setItem('token', value);
  }

  private getLocalToken() : string {
    let token = localStorage.getItem('token');
    if(token === "undefined" || token === "")
      token = null;
    return token;
  }

  /**
   * Send a push registration to the server
   * 
   * @param data The push registration to send
   * @param oldToken Set this to the last token sent to server if you want to update it
   */
  private sendToServer(data : PushRegistration, oldToken? : string) : Promise<PushRegistration> {
    let request : Promise<PushRegistration>;

    if(oldToken) {
      request = this.api.updatePushRegistration(oldToken, data);
    }
    else {
      request = this.api.createPushRegistration(data);
    }

    let onResolve = (result : PushRegistration) => { 
      // ok
      this.setLocalToken(result.token);
      return result;
    };

    let onReject = (error) => {
      // nok 
      throw error;
    };

    return request.then(onResolve, onReject);
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
