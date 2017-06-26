import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER, Type } from '@angular/core';
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
import { WebPushNotificationService } from './services/web/web-push-notification.service';
import { CordovaPushNotificationService } from './services/cordova/cordova-push-notification.service';
import { TestService } from './services/test.service';
import { WebTestService } from './services/web/web-test.service';
import { CordovaTestService } from './services/cordova/cordova-test.service';
import { WindowRefService } from './services/window-ref.service';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { TestListComponent } from './components/test-list/test-list.component';
import { TogglePushComponent } from './components/toggle-push/toggle-push.component';
//import { TestPushNotificationsComponent } from './components/test-push-notifications/test-push-notifications.component';
import { NewTestFormComponent } from './components/new-test-form/new-test-form.component';
import { TestInfoComponent } from './components/test-push-details/test-info/test-info.component';
import { StopButtonComponent } from './components/test-push-details/stop-button/stop-button.component';
import { ReceivedTableComponent } from './components/test-push-details/received-table/received-table.component';
import { TestPushDetailsComponent } from './components/test-push-details/test-push-details.component';
import { NewButtonComponent } from './components/test-push-details/new-button/new-button.component';

import { environment } from '../environments/environment';
import { WebFirebaseMessagingService } from "app/services/web/web-firebase-messaging.service";
import { CordovaFirebaseMessagingService } from "app/services/cordova/cordova-firebase-messaging.service";

/*export function initializePushNotifications(service: PushNotificationService): Function {
  return () => service.initialize().catch((error) => {
    console.error('[app.module]', error);
  });
};*/

export const firebaseMessagingServiceClass : Type<any> = 
  environment.cordova ? CordovaFirebaseMessagingService : WebFirebaseMessagingService;

//alert(firebaseMessagingServiceClass.toString());
  
// export const pushNotificationServiceClass : Type<any> = 
  // environment.cordova ? CordovaPushNotificationService : WebPushNotificationService;
  
export const testServiceClass : Type<any> = 
  environment.cordova ? CordovaTestService : WebTestService;

@NgModule({
  declarations: [
    AppComponent,
    TogglePushComponent,
    //TestPushNotificationsComponent,
    NewTestFormComponent,
    TestListComponent,
    TestInfoComponent,
    StopButtonComponent,
    ReceivedTableComponent,
    TestPushDetailsComponent,
    TestInfoComponent,
    NewButtonComponent
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
    MdCardModule,
    MdInputModule,
    AppRoutingModule
  ],
  providers: [
    ApiService,
    WindowRefService,
    { provide: 'FirebaseMessaging', useClass: firebaseMessagingServiceClass },
    { provide: 'PushNotificationService', useClass: PushNotificationService },
    { provide: 'TestService', useClass: testServiceClass },
    /*{ provide: APP_INITIALIZER,
      useFactory: initializePushNotifications,
      deps: [PushNotificationService], 
      multi: true }*/
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
