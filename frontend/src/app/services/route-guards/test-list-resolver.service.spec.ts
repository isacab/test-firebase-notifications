import { TestBed, inject } from '@angular/core/testing';

import { TestListResolverService } from './test-list-resolver.service';

describe('TestListResolverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TestListResolverService]
    });
  });

  it('should be created', inject([TestListResolverService], (service: TestListResolverService) => {
    expect(service).toBeTruthy();
  }));
});
