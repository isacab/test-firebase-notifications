import { Component, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { PushNotificationService } from './services/push-notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  title : string = 'Test FCM';
  isLoaded : boolean;
  pushIsEnabled : boolean;
  error : string;

  constructor(
    @Inject('PushNotificationService') private pushService : PushNotificationService,
    private router: Router
  ) { }

  ngOnInit() {
    this.pushService.checkAvailable()
      .then(() => this.pushService.loadPushRegistration())
      .then(() => this.updateIsLoaded())
      .catch((err) => {
        this.error = err.message ? err.message : err;
      });

    this.pushService.pushRegistrationChanged.subscribe(() => {
      let reg = this.pushService.pushRegistration;
      this.pushIsEnabled = reg ? reg.enabled : false;
    });

    if('serviceWorker' in navigator) {
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

      /*setTimeout(() => {
        navigator.serviceWorker.register("sw.js").then((reg) => {
          console.log("registered reg: ", reg);
        })
      }, 1000);*/

      navigator.serviceWorker.getRegistration().then((reg) => {
        console.log("getregistration after register reg: ", reg);
      });


      navigator.serviceWorker.ready.then((reg) => {
        console.log("ready reg: ", reg);
        reg.pushManager.getSubscription().then((sub) => {
          console.log("subscription: ", sub);
        });
      });
    }
  }

  updateIsLoaded() {
    this.isLoaded = true;
    return;
    /*let initialized = this.pushService.isInitialized;
    let ready = false;
    if('serviceWorker' in navigator)
      ready = navigator.serviceWorker.controller ? true : false;

    this.isLoaded = initialized && ready;*/
  }
}
