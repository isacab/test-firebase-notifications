import { Component, OnInit, Inject } from '@angular/core';
import { Router, Event as RouterEvent, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router'
import { PushNotificationService } from './services/push-notification.service';
import { WebFirebaseMessagingService } from "app/services/web/web-firebase-messaging.service";

import { environment } from "environments/environment";
import { CordovaFirebaseMessagingService } from "app/services/cordova/cordova-firebase-messaging.service";
import { Helper } from "app/helper";

declare var cordova : any;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  displayLoader : boolean = true;
  title = 'Test FCM';
  github = "https://github.com/isacab/test-firebase-notifications";
  error : string;

  constructor(
    @Inject('PushNotificationService') private pushService : PushNotificationService,
    private router : Router,
    private helper : Helper
  ) { }

  ngOnInit() {
    this.router.events.subscribe((event: RouterEvent) => {
      this.navigationInterceptor(event);
    });
  }

  // Shows and hides the loading spinner during RouterEvent changes
  navigationInterceptor(event: RouterEvent): void {
      if (event instanceof NavigationStart) {
        this.error = "";
        this.displayLoader = true;
      }
      if (event instanceof NavigationEnd) {
        this.displayLoader = false;
      }

      // Set loading state to false in both of the below events to hide the spinner in case a request fails
      if (event instanceof NavigationCancel) {
        this.displayLoader = false;
      }
      if (event instanceof NavigationError) {
        this.error = this.helper.errorMessage(event.error);
        this.displayLoader = false;
      }
  }
}
