import { Injectable, Inject } from '@angular/core';
import { Headers, Http } from '@angular/http';

import { FirebaseApp } from "angularfire2";
import * as firebase from 'firebase';

//import { AngularIndexedDB } from 'angular2-indexeddb';

import 'rxjs/add/operator/toPromise';

import { Shared } from '../shared';
import { IndexedDBService } from './indexed-db.service';

declare var Notification: any;
declare var navigator: any;

export class PushNotificationDataToServer {
  token: string;
  oldToken: string;
  enabled: boolean;
  
  constructor(init?:Partial<PushNotificationDataToServer>) {
    Object.assign(this, init);
  }
}

@Injectable()
export class PushNotificationService {
  
  private readonly apiUrl = Shared.BASE_API_URL;
  private readonly headers = new Headers({'Content-Type': 'application/json'});
  private readonly messaging: firebase.messaging.Messaging;
  
  private isPushEnabled : boolean = false;

  private token : string; // current registrated token

  constructor(@Inject(FirebaseApp) private firebaseApp: firebase.app.App, private http: Http, private db: IndexedDBService) { 
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

  /**
   * Check if push notifications are supported by the browser.
   */
  isSuported() : boolean {
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

  isEnabled() : boolean {
    return this.isPushEnabled;
  }

  /**
   * Enable or disable push notifications.
   * 
   * @param value 
   */
  setEnabled(value : boolean) : Promise<any> {
    // Check if push is already enabled
    if(this.isEnabled() === value)
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
   *    3. set token sent to server = false
   *    4. send token to server
   *    5. set token sent to server = true
   *    6. set isPushEnabled = true
   */
  private enable() : Promise<any> {
    // Request permission, get token and on success, set isPushEnabled to true
    return this.requestPermission()
            .then(this.getToken)
            .then(function(currentToken) {
              this.setTokenSentToServer(false);

              let oldToken = this.token;

              console.log('Current token: ' + currentToken);
              let data = new PushNotificationDataToServer({
                token: currentToken, 
                oldToken: oldToken, 
                enabled: true
              });
              this.sendTokenToServer(data);
              this.token = currentToken;
            })
            .then(function() {
              this.isPushEnabled = true;
            })
            .catch(function(err) {
              this.isPushEnabled = false;
              throw err;
            });
  }

  private disable() : Promise<any> {
    // TODO
    // 1. Tell the server to not send notifications
    // 2. Update lokal database (isEnabled)
    this.isPushEnabled = false;
    let data = new PushNotificationDataToServer({
      enabled: false
    });
    return this.sendTokenToServer(data);
  }

  removeToken() : Promise<void> {
    // TODO
    // 1. Ta bort token
    // 2. Ta bort alla subscriptions från servern
    return null;
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
              this.token = token;
              this.isPushEnabled = (subscription !== null);
              this.setMessagingEventHandlers();
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
                let oldToken = this.token;
                this.setTokenSentToServer(false);
                console.log('Current token: ' + refreshedToken);
                let data = new PushNotificationDataToServer({
                  token: refreshedToken,
                  oldToken: oldToken
                });
                this.sendTokenToServer(data);
                this.token = refreshedToken;
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

  private requestPermission() {
    return this.messaging.requestPermission()
        .then(function () {
            console.log('Notification permission granted.');
        })
        .catch(function (err) {
            console.log('Unable to get permission for notifications.', err);
            throw err;
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

  private tokenSentToServer: boolean = false;
  private setTokenSentToServer(value: boolean) : void {
    // TODO save to indexeddb

    this.tokenSentToServer = value;
  }

  private sendTokenToServer(data: PushNotificationDataToServer) : Promise<boolean> {
    // TODO
    return null;
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
