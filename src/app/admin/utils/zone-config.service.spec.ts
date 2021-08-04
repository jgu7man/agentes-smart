import { TestBed } from '@angular/core/testing';

import { ZoneConfigService } from './zone-config.service';

describe('ZoneConfigService', () => {
  let service: ZoneConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ZoneConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
