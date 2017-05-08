import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import { AngularIndexedDB } from 'angular2-indexeddb';

@Injectable()
export class TestPushNotificationsService {

  constructor(private http: Http, private db: AngularIndexedDB) { }

  startTest(data) {
    
  }

}
