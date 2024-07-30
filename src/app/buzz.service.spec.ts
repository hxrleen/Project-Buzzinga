import { TestBed } from '@angular/core/testing';

import { BuzzService } from './buzz.service';

describe('BuzzService', () => {
  let service: BuzzService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BuzzService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
