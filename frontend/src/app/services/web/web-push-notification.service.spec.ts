import { TestBed, inject } from '@angular/core/testing';

import { WebPushNotificationService } from './web-push-notification.service';

describe('WebPushNotificationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WebPushNotificationService]
    });
  });

  it('should be created', inject([WebPushNotificationService], (service: WebPushNotificationService) => {
    expect(service).toBeTruthy();
  }));
});
