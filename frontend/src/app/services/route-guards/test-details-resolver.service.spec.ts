import { TestBed, inject } from '@angular/core/testing';

import { TestDetailsResolverService } from './test-details-resolver.service';

describe('TestDetailsResolverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TestDetailsResolverService]
    });
  });

  it('should be created', inject([TestDetailsResolverService], (service: TestDetailsResolverService) => {
    expect(service).toBeTruthy();
  }));
});
