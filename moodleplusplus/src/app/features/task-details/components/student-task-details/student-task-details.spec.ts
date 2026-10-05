import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { StudentTaskDetails } from './student-task-details';
import { AuthService } from '../../../../core/services/auth.service';
import { TasksService } from '../../../../core/services/tasks/tasks.service';

describe('StudentTaskDetails', () => {
  let component: StudentTaskDetails;
  let fixture: ComponentFixture<StudentTaskDetails>;

  beforeEach(async () => {
    const tasksService = {
      getAssignment: vi.fn(() =>
        of({
          assignmentId: 'assignment-1',
          taskId: 'task-1',
          title: 'Opgave',
          deadline: '2026-02-01T10:00:00Z',
          status: 'Ikke afleveret',
        }),
      ),
      getSubmission: vi.fn(() => of(null)),
      getFeedback: vi.fn(() => of([])),
      getSubmissionFileUrl: vi.fn(() => ''),
    };
    const authService = { currentUser: { id: 'student-1', role: 'student' } };

    await TestBed.configureTestingModule({
      imports: [StudentTaskDetails],
      providers: [
        { provide: TasksService, useValue: tasksService },
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: { navigate: vi.fn() } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: 'assignment-1' }) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentTaskDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
