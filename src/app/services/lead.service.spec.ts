import { TestBed } from '@angular/core/testing';

import { RecordService } from './lead.service';

describe('LeadService', () => {
  let service: RecordService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecordService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
