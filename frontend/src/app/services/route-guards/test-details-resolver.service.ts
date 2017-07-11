import { Injectable, Inject } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Params, Router } from "@angular/router";
import { Test } from "app/models/test";
import { TestService } from "app/services/test.service";
import { PushNotificationService } from "app/services/push-notification.service";
import { Observable } from "rxjs/Rx";

@Injectable()
export class TestDetailsResolverService implements Resolve<Test> {

  constructor(
    @Inject('TestService') private testService : TestService,
    @Inject('PushNotificationService') private pushService : PushNotificationService,
    private router : Router
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<Test> {
    let token = this.pushService.token;
    
    if(!token) {
      return null;
    } else {
      let id = +route.paramMap.get('id');
      return this.testService.load(id, token);
    }
  }

}
