import { TestBed } from '@angular/core/testing';

import { PortfolioStorage } from './portfolio-storage';

describe('PortfolioStorage', () => {
  let service: PortfolioStorage;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PortfolioStorage);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
