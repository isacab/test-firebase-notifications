import { Injectable, Inject } from '@angular/core';
import { FirebaseApp } from "angularfire2";
import * as firebase from 'firebase';
import { FirebaseMessaging } from "app/services/firebase-messaging";
import { Observable, Subject, ReplaySubject } from "rxjs/Rx";

declare var Notification: any;
declare var navigator: any;

@Injectable()
export class WebFirebaseMessagingService implements FirebaseMessaging {

  protected readonly _messaging : firebase.messaging.Messaging;

  constructor(@Inject(FirebaseApp) private firebaseApp: firebase.app.App) { 
    this._messaging = firebase.messaging(firebaseApp);
  }

  useServiceWorker(registration : any) { //TODO: ServiceWorkerRegistration) {
    this._messaging.useServiceWorker(registration);
  }

  deleteToken(token: string): Observable<any> {
    return Observable.fromPromise(<Promise<any>>this._messaging.deleteToken(token));
  }

  ready() : Observable<any> {
    return Observable.create((observer) => {
      observer.next();
      observer.complete();
    });
  }

  /**
   * Get Instance ID token. The first call to this method makes a network call, once retrieved
   * subsequent calls to getToken will return from cache (if the token has not been deleted in between).
   */
  getToken(): Observable<any> {
    return Observable.fromPromise(<Promise<any>>this._messaging.getToken());
  }

  onMessage(): Observable<any> {
    let onMessageSource = new Subject<any>();
    this._messaging.onMessage((payload) => {
      onMessageSource.next(payload.data);
    });
    let onMessage = onMessageSource.asObservable();
    return onMessage;
  }

  onTokenRefresh(): Observable<any> {
    let onTokenRefreshSource = new Subject<any>();
    this._messaging.onTokenRefresh(onTokenRefreshSource);
    let onTokenRefresh = onTokenRefreshSource.asObservable();
    return onTokenRefresh;
  }

  /** 
   * Request permission for push notifications. 
   * If the browser permission state is 'prompt', the user is asked to Allow or Block notifications.
   * Returns an Observable that fires once if permission could be granted or error if not.
   */
  requestPermission(): Observable<any> {
    return Observable.fromPromise(<Promise<any>>this._messaging.requestPermission());
  }
  
  /**
   * Check if push notifications are supported by the browser.
   * Returns an Observable that is fired once if they are available or error if not available.
   */
  available(): Observable<any> {
    return Observable.create((observer) => {
      if (!('serviceWorker' in navigator)) {
        return observer.error(new Error("Service Worker is not supported in this browser."));
      }

      if (!('PushManager' in window)) {
        return observer.error(new Error("Push is not supported in this browser."));
      }

      this.getNotificationPermissionState()
        .then((state: string) => {
          if(state === 'denied') {
            return observer.error(new Error("Notifications are blocked by the browser."));
          }
          
          // Push notifications is available
          observer.next();
          observer.complete();
        });
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
