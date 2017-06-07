import { Component, OnInit } from '@angular/core';

import { ApiService } from '../services/api.service';
import { PushNotificationService } from '../services/push-notification.service';

import { Test } from '../models/test';

@Component({
  selector: 'app-test-list',
  templateUrl: './test-list.component.html',
  styleUrls: ['./test-list.component.css']
})
export class TestListComponent implements OnInit {

  testList : Array<Test>;

  constructor(private api : ApiService, private pushService : PushNotificationService) { }

  ngOnInit() {
    this.pushService.pushRegistrationChanged.subscribe(() => {
      if(this.testList)
        return;

      let reg = this.pushService.pushRegistration;
      let token = reg ? reg.token : undefined;
      
      if(!token)
        return;

      this.api.getTestList(token).then((data) => {
        this.testList = data;
      });
    });
  }

  trackTest(index, test) {
    return test ? test.id : undefined;
  }

}
