import { TestBed } from '@angular/core/testing';

import { GateOutService } from './gate-out.service';

describe('GateOutService', () => {
  let service: GateOutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GateOutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
