import { Component, OnInit, Inject } from '@angular/core';

import { ApiService } from "app/services/api.service";
import { PushNotificationService } from "app/services/push-notification.service";

import { Test } from "app/models/test";
import { ActivatedRoute } from "@angular/router";


@Component({
  selector: 'app-test-list',
  templateUrl: './test-list.component.html',
  styleUrls: ['./test-list.component.css']
})
export class TestListComponent implements OnInit {

  testList : Array<Test>;

  constructor(
    private api : ApiService, 
    @Inject('PushNotificationService') private pushService : PushNotificationService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.data.subscribe((data: { testList: Array<Test> }) => {
      this.testList = data.testList;
    });
  }

  trackTest(index, test) {
    return test ? test.id : undefined;
  }

}
