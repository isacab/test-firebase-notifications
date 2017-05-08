import { TestBed, inject } from '@angular/core/testing';

import { TestPushNotificationsService } from './test-push-notifications.service';

describe('TestPushNotificationsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TestPushNotificationsService]
    });
  });

  it('should ...', inject([TestPushNotificationsService], (service: TestPushNotificationsService) => {
    expect(service).toBeTruthy();
  }));
});
