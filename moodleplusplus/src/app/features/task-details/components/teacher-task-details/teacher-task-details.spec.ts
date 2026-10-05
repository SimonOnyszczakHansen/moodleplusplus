import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { TeacherTaskDetails } from './teacher-task-details';
import { SubjectsService } from '../../../../core/services/subjects/subjects.service';
import { TasksService } from '../../../../core/services/tasks/tasks.service';
import { Objectives as ObjectivesService } from '../../../objectives/services/objectives';

describe('TeacherTaskDetails', () => {
  let component: TeacherTaskDetails;
  let fixture: ComponentFixture<TeacherTaskDetails>;

  beforeEach(async () => {
    const tasksService = {
      getTask: vi.fn(() =>
        of({
          id: 'task-1',
          subjectId: 'subject-1',
          title: 'Opgave',
          description: 'Beskrivelse',
          deadline: '2026-02-01T10:00:00Z',
          objectives: [],
          assignments: [],
        }),
      ),
      getGroups: vi.fn(() => of([])),
      getStudents: vi.fn(() => of([])),
      getSubmission: vi.fn(() => of(null)),
    };
    const subjectsService = { getMySubjects: vi.fn(() => of([])) };
    const objectivesService = { getObjectivesBySubject: vi.fn(() => of([])) };

    await TestBed.configureTestingModule({
      imports: [TeacherTaskDetails],
      providers: [
        { provide: TasksService, useValue: tasksService },
        { provide: SubjectsService, useValue: subjectsService },
        { provide: ObjectivesService, useValue: objectivesService },
        { provide: Router, useValue: { navigate: vi.fn() } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: 'task-1' }) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TeacherTaskDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
