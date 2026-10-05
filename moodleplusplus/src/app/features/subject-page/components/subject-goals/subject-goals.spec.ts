import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { EMPTY, of } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { SubjectsService } from '../../../../core/services/subjects/subjects.service';

import { SubjectGoals } from './subject-goals';

describe('SubjectGoals', () => {
  let component: SubjectGoals;
  let fixture: ComponentFixture<SubjectGoals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubjectGoals],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: 'subject-1' }) } },
        },
        { provide: AuthService, useValue: { currentUser: { id: 'teacher-1', role: 'teacher' } } },
        {
          provide: SubjectsService,
          useValue: {
            getSubjectById: () => of({
              id: 'subject-1',
              name: 'Programmering',
              createdAt: '2026-01-01T12:00:00Z',
              createdBy: 'teacher-1',
            }),
            getGoalsBySubjectId: () => of([]),
            refresh$: EMPTY,
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubjectGoals);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
