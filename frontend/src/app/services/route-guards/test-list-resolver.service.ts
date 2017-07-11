import { Injectable, Inject } from '@angular/core';
import { ApiService } from "app/services/api.service";
import { PushNotificationService } from "app/services/push-notification.service";
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from "@angular/router";
import { Test } from "app/models/test";

@Injectable()
export class TestListResolverService implements Resolve<Array<Test>> {

  constructor(
    private api : ApiService, 
    @Inject('PushNotificationService') private pushService : PushNotificationService
  ) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<Array<Test>> {
      let token = this.pushService.token;
      
      if(!token) {
        return Promise.resolve([]);
      }
      
      return this.api.getTestList(token);
    }

}
