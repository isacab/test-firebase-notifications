import { Injectable, Inject } from '@angular/core';
import { Headers, Http } from '@angular/http';

import { FirebaseApp } from "angularfire2";
import * as firebase from 'firebase';

import 'rxjs/add/operator/toPromise';

import { Shared } from './shared';

declare var Notification: any;
declare var navigator: any;

@Injectable()
export class PushNotificationService {
  
  private readonly apiUrl = Shared.BASE_API_URL;
  private readonly headers = new Headers({'Content-Type': 'application/json'});
  private readonly messaging: firebase.messaging.Messaging;
  
  private isPushEnabled : boolean = false;

  private token : string; // current registrated token

  constructor(@Inject(FirebaseApp) private firebaseApp: firebase.app.App, private http: Http) { 
    if(this.isSuported()) {
        this.getNotificationPermissionState()
          .then(function(state: string) {
            if(state !== 'denied') {
              this.setUpPush();
            }
          });
    }
  }

  // Check if push notifications are supported by the browser
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
   * Make the client able to receive push notifications
   * This function does following:
   *    1. request permission
   *    2. get token
   *    3. set token sent to server = false
   *    4. send token to server
   *    5. set token sent to server = true
   *    6. set isPushEnabled = true
   */
  enable() : Promise<any> {
    
    if(this.isEnabled())
      return new Promise((resolve, reject) => { resolve(this.token); });

    return this.requestPermission()
            .then(this.getToken)
            .then(function() {
                this.isPushEnabled = true;
            })
            .catch(function(err) {
              this.isPushEnabled = false;
            });
  }

  disable() : Promise<void> {
    // TODO
    // 1. Ta bort subscription från server
    // 2. (Om inga subscriptions => ta bort token) (kanske)
    return null;
  }

  removeToken() : Promise<void> {
    // TODO
    // 1. Ta bort token
    // 2. Ta bort alla subscriptions från servern
    return null;
  }

  // Register the service worker and set up message handlers
  private setUpPush() {
    
    // Register the service worker
    this.registerServiceWorker().then(function (swReg : ServiceWorkerRegistration) {
        swReg.pushManager.getSubscription().then(function (subscription) {
            console.log("subscription", subscription);
            
            this.getToken(function(token) {
              this.token = token;
              this.isPushEnabled = (subscription !== null);
              this.setMessagingEventHandlers();
            });
        });
    });
  }

  private registerServiceWorker() : Promise<ServiceWorkerRegistration> {
    return navigator.serviceWorker.register('sw.js')
        .then(function (swReg) {
            console.log('Service Worker is registered', swReg);

            this.messaging.useServiceWorker(swReg);

            return swReg;
        })
        .catch(function (error) {
            console.error('Service Worker Error', error);
        });
  }

  private setMessagingEventHandlers() : void {
    // Callback fired if Instance ID token is updated.
    this.messaging.onTokenRefresh(function () {
        console.log('Token refreshed.');
        this.messaging.getToken()
            .then(function (refreshedToken) {
                // Indicate that the new Instance ID token has not yet been sent to the
                // app server.
                console.log('Refreshed token: ' + refreshedToken);
                //setTokenSentToServer(false);
                // Send Instance ID token to app server.
                // sendTokenToServer(refreshedToken);
                // ...
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
            console.log('Unable to get permission to notify.', err);
            throw err;
        });
  }

  private getToken() {
    // Get Instance ID token. The first call to this method makes a network call, once retrieved
    // subsequent calls to getToken will return from cache (if the token is not deleted).
    return this.messaging.getToken()
        .then(function (currentToken) {
            if (currentToken && currentToken !== this.token) {
                console.log('Current token: ' + currentToken);
                this.setTokenSentToServer(false);
                this.sendTokenToServer(currentToken);
            } else {
                // Show permission request.
                console.log('No Instance ID token available. Request permission to generate one.');
                // Show permission UI.
                this.setTokenSentToServer(false);
            }

            if(currentToken !== this.token) {
              this.token = currentToken;
            }

            return currentToken;
        })
        .catch(function (err) {
            console.log('An error occurred while retrieving token. ', err);
            //showToken('Error retrieving Instance ID token. ', err);
            this.setTokenSentToServer(false);
            throw err;
        });
  }

  private tokenSentToServer: boolean = false;
  private setTokenSentToServer(value: boolean) : void {
    // TODO
  }

  private sendTokenToServer(token: string) : void {
    // TODO
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
