import { TestBed, inject } from '@angular/core/testing';

import { CordovaFirebaseMessagingService } from './cordova-firebase-messaging.service';

describe('CordovaFirebaseMessagingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CordovaFirebaseMessagingService]
    });
  });

  it('should be created', inject([CordovaFirebaseMessagingService], (service: CordovaFirebaseMessagingService) => {
    expect(service).toBeTruthy();
  }));
});
