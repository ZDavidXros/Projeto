import { TestBed } from '@angular/core/testing';

import { CometchatService } from './cometchat.service';

describe('CometchatService', () => {
  let service: CometchatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CometchatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
