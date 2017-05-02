import { TestBed, inject } from '@angular/core/testing';

import { PushNotificationServiceService } from './push-notification-service.service';

describe('PushNotificationServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PushNotificationServiceService]
    });
  });

  it('should ...', inject([PushNotificationServiceService], (service: PushNotificationServiceService) => {
    expect(service).toBeTruthy();
  }));
});
