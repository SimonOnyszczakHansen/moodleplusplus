import { TestBed } from '@angular/core/testing';

import { SubjectsService } from './subjects.service';

describe('Subjects', () => {
  let service: SubjectsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubjectsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
