import { TestBed } from '@angular/core/testing';

import { PortfolioStorageService } from './portfolio-storage.service';

describe('PortfolioStorageService', () => {
  let service: PortfolioStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PortfolioStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
