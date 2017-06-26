import { TestBed, inject } from '@angular/core/testing';

import { WebFirebaseMessagingService } from './web-firebase-messaging.service';

describe('WebFirebaseMessagingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WebFirebaseMessagingService]
    });
  });

  it('should be created', inject([WebFirebaseMessagingService], (service: WebFirebaseMessagingService) => {
    expect(service).toBeTruthy();
  }));
});
