import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MdSlideToggleModule } from '@angular/material';
import { AngularFireModule } from 'angularfire2';

import 'hammerjs';

import { PushNotificationService } from './services/push-notification.service';
//import { AngularIndexedDB } from 'angular2-indexeddb';
import { IndexedDBService } from './services/indexed-db.service';

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
    BrowserAnimationsModule,
    MdSlideToggleModule,
    AngularFireModule.initializeApp(firebaseConfig),
  ],
  providers: [
    PushNotificationService, 
    //{ provide: AngularIndexedDB, useValue: new AngularIndexedDB(indexeddbName, 1) }
    IndexedDBService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
