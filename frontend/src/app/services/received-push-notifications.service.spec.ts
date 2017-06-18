import { TestBed, inject } from '@angular/core/testing';

import { ReceivedPushNotificationsService } from './received-push-notifications.service';

describe('ReceivedPushNotificationsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReceivedPushNotificationsService]
    });
  });

  it('should ...', inject([ReceivedPushNotificationsService], (service: ReceivedPushNotificationsService) => {
    expect(service).toBeTruthy();
  }));
});
