import { Injectable, Inject } from '@angular/core';
import { WebFirebaseMessagingService } from "app/services/web/web-firebase-messaging.service";
import { FirebaseApp } from "angularfire2";
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";

@Injectable()
export class WebFirebaseMessagingCustomSWService extends WebFirebaseMessagingService {

  constructor(@Inject(FirebaseApp) firebaseApp: firebase.app.App) {
    super(firebaseApp);
  }

  onMessage() : Observable<any> {
    return Observable.create((observer) => {
      navigator.serviceWorker.addEventListener('message', (event) => {
        let data = event.data;

        if(!(data && data.messageType))
          return;
      
        //console.log("[web-firebase-messaging-custom-sw.service] Received data: ", event.data);

        let messageType = data.messageType;

        if(messageType === 'notification') {
          let notificationData = data.data;
          observer.next(notificationData);
        }
      });
    });
  }

}
