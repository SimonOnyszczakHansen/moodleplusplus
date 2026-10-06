import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { EMPTY, of } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { SubjectsService } from '../../../../core/services/subjects/subjects.service';

import { SubjectGoals } from './subject-goals';

describe('SubjectGoals', () => {
  let component: SubjectGoals;
  let fixture: ComponentFixture<SubjectGoals>;
  let createGoalsRequest: any;

  beforeEach(async () => {
    createGoalsRequest = undefined;

    const subjectsServiceMock = {
      getSubjectById: () =>
        of({
          id: 'subject-1',
          name: 'Programmering',
          createdAt: '2026-01-01T12:00:00Z',
          createdBy: 'teacher-1',
        }),
      getGoalsBySubjectId: () => of([]),
      createGoals: (request: unknown) => {
        createGoalsRequest = request;
        return of(undefined);
      },
      createGoal: () => of(undefined),
      editGoalById: () => of(undefined),
      deleteGoalById: () => of(undefined),
      refresh$: EMPTY,
    };

    await TestBed.configureTestingModule({
      imports: [SubjectGoals],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: 'subject-1' }) } },
        },
        { provide: AuthService, useValue: { currentUser: { id: 'teacher-1', role: 'teacher' } } },
        { provide: SubjectsService, useValue: subjectsServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SubjectGoals);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create multiple goals from one textarea input', () => {
    component.onCreateGoal();
    component.formContent = 'Goal one\nGoal two\n\n   Goal three   ';

    component.onSubmitGoal();

    expect(createGoalsRequest).toEqual([
      { subjectId: 'subject-1', content: 'Goal one' },
      { subjectId: 'subject-1', content: 'Goal two' },
      { subjectId: 'subject-1', content: 'Goal three' },
    ]);
  });
});
