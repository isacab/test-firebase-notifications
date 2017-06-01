import { Injectable, Inject } from '@angular/core';

import { FirebaseApp } from "angularfire2";
import * as firebase from 'firebase';

import 'rxjs/add/operator/toPromise';
import { Observable, ReplaySubject, BehaviorSubject } from 'rxjs';

import { ApiService } from './api.service';

import { PushRegistration } from '../models/push-registration';

import { Helpers } from '../helpers';
import { PushNotAvailableError } from '../errors';

declare var Notification: any;
declare var navigator: any;

@Injectable()
export class PushNotificationService {
  
  private readonly _messaging : firebase.messaging.Messaging;

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

  // pushRegistration - observable property
  private _pushRegistrationSource : BehaviorSubject<PushRegistration> = new BehaviorSubject<PushRegistration>(null);
  pushRegistrationChanged = this._pushRegistrationSource.asObservable();
  get pushRegistration() : PushRegistration {
    return this._pushRegistrationSource.getValue();
  }
  private setPushRegistration(value : PushRegistration) : void {
    this.setValue(this._pushRegistrationSource, value);
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
   * Initialize the service.
   * This method should be called on application startup to set up the service worker for receiving push notifications
   * and get the initial state of pushRegistration from server.
   * Resolves and sets isInitialized to true if initialization went well otherwise it rejects and leaves isInitialized as false.
   */
  initialize() : Promise<any> {
    return this.checkAvailable()
      .then(() => this.registerServiceWorker())
      .then((swReg : ServiceWorkerRegistration) => {
          // for debugging
          swReg.pushManager.getSubscription().then((subscription) => {
            console.log("subscription", subscription);
          });
      })
      .then(() => this.setMessagingEventListeners())
      .then(() => this.getToken())
      .then(() => this.setIsInitialized(true))
      .catch((error) => {
        // Something went wrong during the initialization
        throw error;
      });
  }

  /**
   * This method sets pushRegistration to the current push registration on the server.
   * This method also updates the token if a new token has not been sent to the server yet.
   * 
   * @param token Current registration token generated from messaging.getToken()
   */
  loadPushRegistration() : Promise<PushRegistration> {
    let promise = new Promise<PushRegistration>((resolve, reject) => {

      this._messaging.getToken().then((token) => {
        let rv : Promise<PushRegistration>;

        // Get the last token sent to the server from local storage
        let lastSentToken = this.getLocalToken();

        // Check if we have a token that has not been sent to the server yet
        if(lastSentToken && !token) {
          this.sendToServer(null, lastSentToken);
          rv = null;
        } else if(lastSentToken && lastSentToken !== token) {
          // Get current push registration at the server
          rv = this.api.getPushRegistration(lastSentToken)
            .then((reg : PushRegistration) => {
              // Update the push registration with the current token
              reg.token = token;
              reg.enabled = token ? reg.enabled : false;
              return this.sendToServer(reg, lastSentToken);
            }).catch((error) => {
              if(error.message === 'Resource not found') {
                // This happens when we have tried to update but token did not exist.
                return this.loadPushRegistration();
              } else {
                throw error;
              }
            });
        } else if(token) {
          // Get current push registration at the server
          rv = this.api.getPushRegistration(token)
            .catch((error) => {
              if(error.message === 'Resource not found') {
                return null;
              } else {
                throw error;
              }
            });
        } else {
          rv = null;
        }

        return rv;
        
      }).then((reg : PushRegistration) => {
        this.setPushRegistration(reg);
        resolve(reg);
      }).catch((error) => {
          reject(new Error("Could not load push registration."));
      });
      
    });

    return promise;
  }

  /**
   * Check if push notifications are supported by the browser.
   * Returns a promise that resolves if they are available or rejects if not available.
   * There is no data passed on resolve.
   */
  checkAvailable() : Promise<any> {
    let promise = new Promise<any>((resolve, reject) => {
      
      if (!('serviceWorker' in navigator)) {
        reject(new PushNotAvailableError("Service Worker is not supported on this browser."));
        return;
      }

      if (!('PushManager' in window)) {
        reject(new PushNotAvailableError("Push is not supported on this browser."));
        return;
      }

      this.getNotificationPermissionState()
        .then(function(state: string) {
          if(state === 'denied') {
            reject(new PushNotAvailableError("Notifications are blocked by the browser."));
            return;
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

    let enabled = this.pushRegistration ? this.pushRegistration.enabled : false;

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

          let oldToken = this.pushRegistration ? this.pushRegistration.token : undefined;

          let data = new PushRegistration({
            token: currentToken,
            enabled: true
          });

          return this.sendToServer(data, oldToken);
        })
        .then((reg : PushRegistration) => {
          this.setPushRegistration(reg);
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
    const currentToken = this.pushRegistration ? this.pushRegistration.token : undefined;
    const data = new PushRegistration({
      token: currentToken,
      enabled: false
    });
    
    let promise = this.sendToServer(data, currentToken)
      .then((reg : PushRegistration) => {
        this.setPushRegistration(reg);
      })
      .catch(function(err) {
        throw err;
      });

    return promise;
  }

  /**
   * Register the service worker used to receive push notifications.
   * The notifications received when application is in background or closed are handled by the service worker.
   */
  private registerServiceWorker() : Promise<ServiceWorkerRegistration> {
    return navigator.serviceWorker.register('sw.js')
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
   * Set the firebase messaging event listeners that handles onTokenRefresh and onMessage
   */
  private setMessagingEventListeners() : void {
    let messaging = this._messaging;

    // Callback fired if Instance ID token is updated.
    messaging.onTokenRefresh(() => {
        console.log('Token refreshed.');
        messaging.getToken()
            .then((refreshedToken) => {
                let oldToken = this.pushRegistration ? this.pushRegistration.token : undefined;
                let enabled = this.pushRegistration ? this.pushRegistration.enabled : false;
                let data = new PushRegistration({
                  token: refreshedToken,
                  enabled: enabled
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
   * subsequent calls to getToken will return from cache (if the token has not been deleted in between).
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
   * If the browser permission state is 'prompt', the user is asked to Allow or Block notifications.
   * Returns a promise that resolves if permission could be granted and rejects if not.
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

  /**
   * Set the last sent token sent to server in local storage
   * 
   * @param value the token
   */
  private setLocalToken(value: string) : void {
    localStorage.setItem('token', value);
  }

  /**
   * Get the last token sent to server from local storage
   */
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
      if(data) {
        request = this.api.updatePushRegistration(oldToken, data);
      } else {
        request = this.api.removePushRegistration(oldToken);
      }
    }
    else {
      request = this.api.createPushRegistration(data);
    }

    let onResolve = (result : PushRegistration) => { 
      // ok
      let newToken = result ? result.token : '';
      this.setLocalToken(newToken);
      return result;
    };

    let onReject = (error) => {
      // nok 
      if(error.message === 'Resource not found') {
        this.setLocalToken('');
      }

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
