import { Injectable, Inject } from '@angular/core';
import { Headers, Http } from '@angular/http';

import { FirebaseApp } from "angularfire2";
import * as firebase from 'firebase';

import 'rxjs/add/operator/toPromise';

import { Shared } from './shared';

declare var Notification: any;

@Injectable()
export class PushNotificationService {
  
  private readonly apiUrl = Shared.BASE_API_URL;
  private readonly headers = new Headers({'Content-Type': 'application/json'});
  private readonly messaging: firebase.messaging.Messaging;
  
  private isPushEnabled : boolean = false;

  constructor(@Inject(FirebaseApp) private firebaseApp: firebase.app.App, private http: Http) { 
    if(this.isSuported()) {
        this.setUpPush();
    }
  }

  isSuported() : boolean {
    if (!('serviceWorker' in navigator)) {
        console.log("Service Worker isn't supported on this browser.");
        return false;
    }

    if (!('PushManager' in window)) {
        console.log("Push isn't supported on this browser.");
        return false;
    }

    if (!('Notification' in window) || Notification.permission === 'denied') {  
      console.log('The user has blocked notifications.');  
      return false;  
    }

    return true;
  }

  setUpPush() {
    
    // Register the service worker
    this.registerServiceWorker().then(function (swReg : ServiceWorkerRegistration) {
        swReg.pushManager.getSubscription().then(function (subscription) {
            console.log("subscription", subscription);

            this.isPushEnabled = (subscription !== null);

            this.setMessagingEventHandlers();
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
    // TODO
  }

}
