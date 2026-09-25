import { TestBed } from '@angular/core/testing';

import { Objectives } from './objectives';

describe('Objectives', () => {
  let service: Objectives;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Objectives);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
