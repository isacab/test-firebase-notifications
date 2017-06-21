import { TestBed, inject } from '@angular/core/testing';

import { CordovaTestService } from './cordova-test.service';

describe('CordovaTestService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CordovaTestService]
    });
  });

  it('should be created', inject([CordovaTestService], (service: CordovaTestService) => {
    expect(service).toBeTruthy();
  }));
});
