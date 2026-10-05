import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { SubjectsService } from '../../../../core/services/subjects/subjects.service';
import { TasksService } from '../../../../core/services/tasks/tasks.service';

import { SubjectTasks } from './subject-tasks';

describe('SubjectTasks', () => {
  let component: SubjectTasks;
  let fixture: ComponentFixture<SubjectTasks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubjectTasks],
      providers: [
        provideRouter([]),
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
            getTasksBySubjectId: () => of([]),
            getSubjectsData: () => of([]),
          },
        },
        {
          provide: TasksService,
          useValue: {
            getGroups: () => of([]),
            getStudents: () => of([]),
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubjectTasks);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
