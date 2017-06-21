import { TestBed, inject } from '@angular/core/testing';

import { CordovaPushNotificationService } from './cordova-push-notification.service';

describe('CordovaPushNotificationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CordovaPushNotificationService]
    });
  });

  it('should be created', inject([CordovaPushNotificationService], (service: CordovaPushNotificationService) => {
    expect(service).toBeTruthy();
  }));
});
