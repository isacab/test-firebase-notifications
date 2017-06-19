import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { PushNotificationService } from './services/push-notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  title : string = 'Test Firebase Push Notifications';
  isLoaded : boolean;
  pushIsEnabled : boolean;
  error : string;

  constructor(
    private pushService : PushNotificationService, 
    private router: Router
  ) { }

  ngOnInit() {
    this.pushService.initialize()
      .then(() => {
        this.updateIsLoaded();
      })
      .catch((err) => {
        this.error = err.message ? err.message : err;
      });

    this.pushService.pushRegistrationChanged.subscribe(() => {
      let reg = this.pushService.pushRegistration;
      this.pushIsEnabled = reg ? reg.enabled : false;
    });

    if('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        this.updateIsLoaded();
      });
    }
  }

  updateIsLoaded() {
    let initialized = this.pushService.isInitialized;
    let ready = false;
    if('serviceWorker' in navigator)
      ready = navigator.serviceWorker.controller ? true : false;

    this.isLoaded = initialized && ready;
  }
}
