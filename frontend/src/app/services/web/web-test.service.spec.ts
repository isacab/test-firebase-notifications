import { TestBed, inject } from '@angular/core/testing';

import { WebTestService } from './web-test.service';

describe('WebTestService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WebTestService]
    });
  });

  it('should be created', inject([WebTestService], (service: WebTestService) => {
    expect(service).toBeTruthy();
  }));
});
