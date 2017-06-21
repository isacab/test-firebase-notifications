import { Injectable, Inject } from '@angular/core';

import { FirebaseApp } from "angularfire2";
import * as firebase from 'firebase';

import 'rxjs/add/operator/toPromise';
import { Observable, ReplaySubject, BehaviorSubject, Subject } from 'rxjs';

import { ApiService } from './api.service';

import { PushRegistration } from '../models/push-registration';

declare var Notification: any;
declare var navigator: any;

@Injectable()
export abstract class PushNotificationService {

  constructor(private api : ApiService) {
    //this.setMessagingEventListeners();
  }

  // pushRegistration - observable property
  private _pushRegistrationSource = new BehaviorSubject<PushRegistration>(null);
  readonly pushRegistrationChanged = this._pushRegistrationSource.asObservable();
  get pushRegistration() : PushRegistration {
    return this._pushRegistrationSource.getValue();
  }
  private setPushRegistration(value : PushRegistration) : void {
    this.setValue(this._pushRegistrationSource, value);
  }

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

  // [start] Abstract methods

  //abstract initialize() : Promise<any>;

  abstract checkAvailable() : Promise<any>;
  
  protected abstract getToken() : Promise<any> | null;

  protected abstract onMessage(nextOrObserver : Object) : void;

  protected abstract onTokenRefresh(nextOrObserver : Object) : void;

  protected abstract requestPermission() : Promise<any> | null;

  // [end] Abstract methods

  /**
   * This method sets pushRegistration to the current push registration on the server.
   * This method also updates the token if a new token has not been sent to the server yet.
   * 
   * @param token Current registration token generated from messaging.getToken()
   */
  loadPushRegistration() : Promise<PushRegistration> {
    return new Promise<PushRegistration>((resolve, reject) => {

      this.getToken().then((token) => {
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
                this.setLocalToken('');
                return this.loadPushRegistration();
              } else {
                throw error;
              }
            });
        } else if(token) {
          // Get current push registration at the server
          rv = this.api.getPushRegistration(token)
            .then((reg : PushRegistration) => {
              if(!lastSentToken)
                this.setLocalToken(reg.token);
              return reg;
            })
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
        this.setMessagingEventListeners();
        resolve(reg);
      }).catch((error) => {
        reject(new Error("Could not load push registration: " + error));
      });
      
    });
  }

  /**
   * Enable or disable push notifications.
   * 
   * @param value 
   */
  setEnabled(value : boolean) : Promise<any> {

    let enabled = this.pushRegistration ? this.pushRegistration.enabled : false;

    // Check if push is already enabled
    if(enabled === value) {
      return Promise.resolve();
    }

    return value ? this.enable() : this.disable();
  }

  /**
   * Private helper method to setEnabled. This method enables push notifications.
   */
  private enable() : Promise<any> {
    // Request permission, get token and on success, set isPushEnabled to true
    return new Promise((resolve, reject) => {
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
    
    return this.sendToServer(data, currentToken)
      .then((reg : PushRegistration) => {
        this.setPushRegistration(reg);
      })
      .catch(function(err) {
        throw err;
      });
  }

  /**
   * Set the firebase messaging event listeners that handles onTokenRefresh and onMessage
   */
  private setMessagingEventListeners() : void {

    // Callback fired if Instance ID token is updated.
    this.onTokenRefresh(() => {
        console.log('Token refreshed.');
        this.getToken()
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
    this.onMessage((payload) => {
        console.log("[push-notification.service] message received", payload);
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
   * @param data The push registration to send
   * @param oldToken Set this to the last token sent to server if you want to update it
   */
  protected sendToServer(data : PushRegistration, oldToken? : string) : Promise<PushRegistration> {
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

}
