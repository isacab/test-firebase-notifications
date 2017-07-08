import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER, Type } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFireModule } from 'angularfire2';
import { RouterModule, Routes } from '@angular/router';
import { MdButtonModule, MdTabsModule, MdProgressSpinnerModule, MdToolbarModule, MdInputModule, MdMenuModule } from '@angular/material';

import 'hammerjs';

import { ApiService } from './services/api.service';
import { PushNotificationService } from './services/push-notification.service';
import { TestService } from './services/test.service';
import { WebCustomSWTestService } from './services/web/web-custom-sw-test.service';
import { CordovaTestService } from './services/cordova/cordova-test.service';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { TestListComponent } from './components/test-list/test-list.component';
import { TogglePushComponent } from './components/toggle-push/toggle-push.component';
//import { TestPushNotificationsComponent } from './components/test-push-notifications/test-push-notifications.component';
import { NewTestFormComponent } from './components/new-test-form/new-test-form.component';
import { TestInfoComponent } from './components/test-push-details/test-info/test-info.component';
import { ReceivedTableComponent } from './components/test-push-details/received-table/received-table.component';
import { TestPushDetailsComponent } from './components/test-push-details/test-push-details.component';

import { environment } from '../environments/environment';
import { WebFirebaseMessagingService } from "app/services/web/web-firebase-messaging.service";
import { CordovaFirebaseMessagingService } from "app/services/cordova/cordova-firebase-messaging.service";
import { WebFirebaseMessagingCustomSWService } from "app/services/web/web-firebase-messaging-custom-sw.service";
import { PingComponent } from './components/ping/ping.component';

export function initializePushNotifications(service: PushNotificationService): Function {
  const swFileName = 'sw.js';
  //const swFileName = firebase-messaging-sw-template.js';

  return () => service.ready()
    .then(() => service.checkAvailable())
    .then(() => {
      if(service.messaging instanceof WebFirebaseMessagingService) {
        let fcm = (<WebFirebaseMessagingService>(service.messaging));
        return navigator.serviceWorker.register(swFileName)
          .then((reg) => {
            fcm.useServiceWorker(reg);
          });
      }
    })
    .then(() => service.loadPushRegistration());
};

export const firebaseMessagingServiceClass : Type<any> = 
  environment.cordova ? CordovaFirebaseMessagingService : WebFirebaseMessagingCustomSWService;
  
export const testServiceClass : Type<any> = 
  environment.cordova ? CordovaTestService : WebCustomSWTestService;

@NgModule({
  declarations: [
    AppComponent,
    TogglePushComponent,
    //TestPushNotificationsComponent,
    NewTestFormComponent,
    TestListComponent,
    TestInfoComponent,
    ReceivedTableComponent,
    TestPushDetailsComponent,
    TestInfoComponent,
    PingComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    JsonpModule,
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    MdButtonModule,
    MdProgressSpinnerModule,
    MdToolbarModule,
    MdTabsModule,
    MdInputModule,
    AppRoutingModule,
    MdMenuModule
  ],
  providers: [
    ApiService,
    { provide: 'FirebaseMessaging', useClass: firebaseMessagingServiceClass },
    { provide: 'PushNotificationService', useClass: PushNotificationService },
    { provide: 'TestService', useClass: testServiceClass },
    { provide: APP_INITIALIZER,
      useFactory: initializePushNotifications,
      deps: ['PushNotificationService'], 
      multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
