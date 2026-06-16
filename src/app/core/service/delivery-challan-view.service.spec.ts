import { TestBed } from '@angular/core/testing';

import { DeliveryChallanViewService } from './delivery-challan-view.service';

describe('DeliveryChallanViewService', () => {
  let service: DeliveryChallanViewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeliveryChallanViewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
