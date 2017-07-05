import { Component, OnInit, Inject } from '@angular/core';
import { Router, Event as RouterEvent, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router'
import { PushNotificationService } from './services/push-notification.service';
import { WebFirebaseMessagingService } from "app/services/web/web-firebase-messaging.service";

import { environment } from "environments/environment";
import { CordovaFirebaseMessagingService } from "app/services/cordova/cordova-firebase-messaging.service";

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
  ) { }

  ngOnInit() {
    this.router.events.subscribe((event: RouterEvent) => {
      this.navigationInterceptor(event);
    });

    // debugging cordova
    document.addEventListener('deviceready', function(){
      console.log("cordovaready");
    }, false);

    /*if('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration('/firebase-cloud-messaging-push-scope').then((reg : ServiceWorkerRegistration) => {
        console.log("firebase-cloud-messaging-push-scope reg: ", reg);
        reg.addEventListener('message', (m) => {
          console.log('message: ', m);
        });
        reg.pushManager.getSubscription().then((sub) => {
          console.log("firebase-cloud-messaging-push-scope subscription: ", sub);
        });
      });

      navigator.serviceWorker.getRegistration().then((reg) => {
        console.log("getregistration before register reg: ", reg);
      });

      setTimeout(() => {
        navigator.serviceWorker.register("sw.js").then((reg) => {
          console.log("registered reg: ", reg);
        })
      }, 1000);

      navigator.serviceWorker.getRegistration().then((reg) => {
        console.log("getregistration after register reg: ", reg);
      });


      navigator.serviceWorker.ready.then((reg) => {
        console.log("ready reg: ", reg);
        reg.pushManager.getSubscription().then((sub) => {
          console.log("subscription: ", sub);
        });
      });
    }*/
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
        this.error = this.errorMessage(event.error);
        this.displayLoader = false;
      }
  }

  private errorMessage(error : any) : string {
    if(!error) {
      return "Unknown failure";
    }

    if(error instanceof String) {
      return error.toString();
    }

    if(navigator && navigator.onLine === false) {
      return "You are offline";
    }

    return error.message || "Unknown failure. You can try reload the page.";
  }
}
