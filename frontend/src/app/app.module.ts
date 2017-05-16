import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MdSlideToggleModule } from '@angular/material';
import { AngularFireModule } from 'angularfire2';

import 'hammerjs';

import { ApiService } from './services/api.service';
import { PushNotificationService } from './services/push-notification.service';
//import { AngularIndexedDB } from 'angular2-indexeddb';
import { IndexedDBService } from './services/indexed-db.service';
import { TestPushNotificationsService } from './services/test-push-notifications.service';

import { AppComponent } from './app.component';
import { TogglePushComponent } from './test-push-notifications/toggle-push/toggle-push.component';
import { TestPushNotificationsComponent } from './test-push-notifications/test-push-notifications.component';
import { TestPushFormComponent } from './test-push-notifications/test-push-form/test-push-form.component';

export const firebaseConfig = {
  apiKey: "AIzaSyDfhytBVEC-aAXdAj8W0PThyalEkwcvfEo",
  authDomain: "testnotificationsfirebase.firebaseapp.com",
  databaseURL: "https://testnotificationsfirebase.firebaseio.com",
  projectId: "testnotificationsfirebase",
  storageBucket: "testnotificationsfirebase.appspot.com",
  messagingSenderId: "170551356465"
};

export const indexeddbName = 'test_firebase_db';

export function openIndexedDB(db: IndexedDBService): Function {
  return () => db.open();
};

export function initializePushNotifications(service: PushNotificationService): Function {
  return () => service.initialize();
};

@NgModule({
  declarations: [
    AppComponent,
    TogglePushComponent,
    TestPushNotificationsComponent,
    TestPushFormComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    JsonpModule,
    BrowserAnimationsModule,
    MdSlideToggleModule,
    AngularFireModule.initializeApp(firebaseConfig),
  ],
  providers: [
    ApiService,
    PushNotificationService, 
    //{ provide: AngularIndexedDB, useValue: new AngularIndexedDB(indexeddbName, 1) }
    IndexedDBService,
    TestPushNotificationsService,
    { provide: APP_INITIALIZER,
      useFactory: openIndexedDB,
      deps: [IndexedDBService], 
      multi: true },
    { provide: APP_INITIALIZER,
      useFactory: initializePushNotifications,
      deps: [PushNotificationService], 
      multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
