import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { PushRegistration } from '../models/push-registration';

@Injectable()
export class TestPushNotificationsService {

  constructor(private api : ApiService) { }

  send(token : string) {
    this.api.sendPushNotification(token);
  }

}
