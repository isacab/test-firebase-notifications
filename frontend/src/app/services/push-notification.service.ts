import { Injectable, Inject } from '@angular/core';

import { FirebaseApp } from "angularfire2";
import * as firebase from 'firebase';

import 'rxjs/add/operator/toPromise';
import { Observable, ReplaySubject, BehaviorSubject, Subject } from 'rxjs';

import { ApiService } from './api.service';

import { PushRegistration } from '../models/push-registration';
import { FirebaseMessaging } from "app/services/firebase-messaging";

declare var Notification: any;
declare var navigator: any;

@Injectable()
export class PushNotificationService {

  constructor(
    @Inject('FirebaseMessaging') public messaging : FirebaseMessaging, 
    private api : ApiService
  ) {
    this.ready().then(() => {
      this.setMessagingEventListeners()
    });
  }

  // token - observable property
  private _tokenSource = new BehaviorSubject<string>(null);
  readonly tokenChanged = this._tokenSource.asObservable();
  get token() : string {
    return this._tokenSource.getValue();
  }
  private setToken(value : string) : void {
    this.setValue(this._tokenSource, value);
  }

  // Notification received observer
  private _onNotificationReceivedSource : Subject<any> = new Subject<any>();
  readonly onNotificationReceived = this._onNotificationReceivedSource.asObservable();

  /**
   * set value for an BehaviorSubject
   */ 
  private setValue<T>(subject : BehaviorSubject<T>, value : T) : void {
    if(subject.getValue() !== value) {
      subject.next(value);
    }
  }

  ready() : Promise<any> {
    return this.messaging.ready().toPromise();
  }

  checkAvailable() : Promise<any> {
    return this.messaging.available().toPromise();
  }

  /**
   * load token
   */
  loadToken() : Promise<string> {

    return new Promise<string>((resolve, reject) => {
      // Get the last token sent to the server from local storage
      let lastSentToken = this.getLocalToken();

      this.messaging.getToken().toPromise()
        .then((token) => {
          // Check if we have a token that has not been sent to the server yet
          if(lastSentToken != token) {
            // Update token at server
            return this.sendToServer(token, lastSentToken);
          }
          return token;
        }).then((token : string) => {
          this.setToken(token);
          resolve(token);
        }).catch((error) => {
          if(lastSentToken)
            this.setToken(lastSentToken);
          resolve(lastSentToken);
        });
      
    });
  }

  /**
   * Request permission, get token, send it to the server, save token in localstorage and on success: resolve, otherwise reject
   */ 
  register() : Promise<PushRegistration> {
    return new Promise((resolve, reject) => {
      this.messaging.requestPermission().toPromise()
        .then(() => this.messaging.getToken().toPromise()) // get current token
        .then((currentToken) => this.sendToServer(currentToken)) // send current token to server
        .then((token : string) => {
          this.setToken(token); // save token in localstorage
          resolve(token);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * Set the firebase messaging event listeners that handles onTokenRefresh and onMessage
   */
  private setMessagingEventListeners() : void {

    // Callback fired if Instance ID token is updated.
    this.messaging.onTokenRefresh().subscribe(() => {
        console.log('Token refreshed.');
        this.messaging.getToken().toPromise()
            .then((refreshedToken) => {
                let oldToken = this.token;
                return this.sendToServer(refreshedToken, oldToken);
            })
            .then((tokenFromServer : string) => {
                console.log('Refreshed token: ' + tokenFromServer);
            })
            .catch(function (err) {
                console.log('Unable to retrieve refreshed token ', err);
            });
    });

    // Handle incoming messages. Called when:
    // - a message is received while the app has focus
    // - the user clicks on an app notification created by a sevice worker
    //   `messaging.setBackgroundMessageHandler` handler.
    this.messaging.onMessage().subscribe((payload) => {
        //console.log("[push-notification.service] message received: " + JSON.stringify(payload));
        this._onNotificationReceivedSource.next(payload);
    });
  }

  /**
   * Set the last sent token sent to server in local storage
   * 
   * @param value the token
   */
  protected setLocalToken(value: string) : void {
    localStorage.setItem('token', value);
  }

  /**
   * Get the last token sent to server from local storage
   */
  protected getLocalToken() : string {
    let token = localStorage.getItem('token');
    if(token === "undefined" || token === "")
      token = null;
    return token;
  }

  /**
   * Send a push registration to the server
   * 
   * @param token - The new token to send
   * @param oldToken - The last token sent to server
   */
  protected sendToServer(token : string, oldToken? : string) : Promise<string> {
    let request : Promise<PushRegistration>;
    let data = new PushRegistration({token: token});

    if(oldToken) {
      if(token) {
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
      return newToken;
    };

    let onReject = (error) => {
      // nok 
      if(error.message === 'Resource not found') {
        this.setLocalToken('');
        return this.sendToServer(token);
      }

      if(error.message === 'Already registrated') {
        this.setLocalToken(token);
        return token;
      }

      console.error("[push-notification.service] Could not send to server.", error);

      return Promise.reject(error);
    };

    return request.then(onResolve, onReject);
  }

}
