import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MdButtonModule } from '@angular/material';
import { AngularFireModule } from 'angularfire2';

import 'hammerjs';

import { ApiService } from './services/api.service';
import { PushNotificationService } from './services/push-notification.service';
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

export function initializePushNotifications(service: PushNotificationService): Function {
  return () => service.initialize().catch((error) => {});
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
    MdButtonModule,
    AngularFireModule.initializeApp(firebaseConfig),
  ],
  providers: [
    ApiService,
    PushNotificationService, 
    TestPushNotificationsService,
    { provide: APP_INITIALIZER,
      useFactory: initializePushNotifications,
      deps: [PushNotificationService], 
      multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
