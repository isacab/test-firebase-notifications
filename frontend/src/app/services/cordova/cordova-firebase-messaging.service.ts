import { Injectable } from '@angular/core';
import { FirebaseMessaging } from "app/services/firebase-messaging";
import { Observable, Subject } from "rxjs/Rx";

declare var device : any;
declare var document : any;
declare var FCMPlugin : any;

@Injectable()
export class CordovaFirebaseMessagingService implements FirebaseMessaging {

  constructor() { }

  private get firebasePlugin() {
    return (<any>window).FirebasePlugin;
  }

  ready() : Observable<any> {
    return Observable.create((observer) => {
      document.addEventListener('deviceready', () => {
        observer.next();
        observer.complete();
      });
    });
  }

  getToken(): Observable<any> {
    return Observable.create((observer) => {
      this.firebasePlugin.getToken(
        (token) => {
          if(token)
            observer.next(token);
          else
            observer.error("Could not get token");
          observer.complete();
        },
        (err) => {
          observer.error(err);
          observer.complete();
        }
      );
    });
  }

  onMessage(): Observable<any> {
    return Observable.create((observer) => {
      this.firebasePlugin.onNotificationOpen(
        (data) => observer.next(data),
        (err) => observer.error(err)
      );
    });
  }

  onTokenRefresh(): Observable<any> {
    return Observable.create((observer) => {
      this.firebasePlugin.onTokenRefresh(
        (token) => observer.next(token),
        (err) => observer.error(err)
      );
    });
  }

  requestPermission(): Observable<any> {
    return Observable.create((observer) => {
      if(this.platform() === 'Android') {
        observer.next();
        observer.complete();
      } else {
        this.firebasePlugin.grantPermission(
          (token) => {
            observer.next(token);
            observer.complete();
          },
          (err) => {
            observer.error(err);
            observer.complete();
          }
        );
      }
    });
  }

  available(): Observable<any> {
    return Observable.create((observer) => {
      let platform = this.platform();

      if(platform === 'Android' || platform === 'iOS') {
        observer.next();
      } else {
        observer.error("App is not running on android or ios");
      }

      observer.complete();
    });
  }

  private platform() : string {
    let platform = device.platform;
    return platform;
  }

}
