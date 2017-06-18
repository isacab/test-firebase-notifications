import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFireModule } from 'angularfire2';
import { MdButtonModule } from '@angular/material';
import { MdProgressSpinnerModule } from '@angular/material';
import { MdToolbarModule } from '@angular/material';
import { MdCardModule } from '@angular/material';
import { MdInputModule } from '@angular/material';
import { RouterModule, Routes } from '@angular/router';

import 'hammerjs';

import { ApiService } from './services/api.service';
import { PushNotificationService } from './services/push-notification.service';
import { TestPushNotificationsService } from './services/test-push-notifications.service';
import { ReceivedPushNotificationsService } from './services/received-push-notifications.service';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { TogglePushComponent } from './test-push-notifications/toggle-push/toggle-push.component';
import { TestPushNotificationsComponent } from './test-push-notifications/test-push-notifications.component';
import { TestPushFormComponent } from './test-push-notifications/test-push-form/test-push-form.component';
import { TestListComponent } from './test-list/test-list.component';
import { TestPushDataComponent } from './test-push-notifications/test-push-data/test-push-data.component';
import { StopButtonComponent } from './test-push-notifications/stop-button/stop-button.component';

export const firebaseConfig = {
  apiKey: "AIzaSyDfhytBVEC-aAXdAj8W0PThyalEkwcvfEo",
  authDomain: "testnotificationsfirebase.firebaseapp.com",
  databaseURL: "https://testnotificationsfirebase.firebaseio.com",
  projectId: "testnotificationsfirebase",
  storageBucket: "testnotificationsfirebase.appspot.com",
  messagingSenderId: "170551356465"
};

export function initializePushNotifications(service: PushNotificationService): Function {
  return () => service.initialize().catch((error) => {
    console.error('[app.module]', error);
  });
};

@NgModule({
  declarations: [
    AppComponent,
    TogglePushComponent,
    TestPushNotificationsComponent,
    TestPushFormComponent,
    TestListComponent,
    TestPushDataComponent,
    StopButtonComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    JsonpModule,
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(firebaseConfig),
    MdButtonModule,
    MdProgressSpinnerModule,
    MdToolbarModule,
    MdCardModule,
    MdInputModule,
    AppRoutingModule
  ],
  providers: [
    ApiService,
    PushNotificationService, 
    TestPushNotificationsService,
    ReceivedPushNotificationsService,
    /*{ provide: APP_INITIALIZER,
      useFactory: initializePushNotifications,
      deps: [PushNotificationService], 
      multi: true }*/
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
