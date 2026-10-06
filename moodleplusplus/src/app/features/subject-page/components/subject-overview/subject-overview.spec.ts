import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../../../core/services/auth.service';
import { SubjectsService } from '../../../../core/services/subjects/subjects.service';
import { TasksService } from '../../../../core/services/tasks/tasks.service';

import { SubjectOverview } from './subject-overview';

describe('SubjectOverview', () => {
  let component: SubjectOverview;
  let fixture: ComponentFixture<SubjectOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubjectOverview],
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
            getSubjectById: () =>
              of({
                id: 'subject-1',
                name: 'Programmering',
                createdAt: '2026-01-01T12:00:00Z',
                createdBy: 'teacher-1',
              }),
            getTeacherBySubjectId: () =>
              of({
                id: 'teacher-1',
                name: 'David Svarrer',
                email: 'david@example.com',
              }),
            getGoalsBySubjectId: () => of([]),
            getStudentsBySubjectId: () => of([]),
          },
        },
        {
          provide: TasksService,
          useValue: {
            getTasksBySubjectId: () => of([]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SubjectOverview);
    component = fixture.componentInstance;
    component.subject.set({
      id: 'subject-1',
      name: 'Programmering',
      createdAt: '2026-01-01T12:00:00Z',
      createdBy: 'teacher-1',
    });
    component.goals.set([
      { id: 'goal-1', subjectId: 'subject-1', content: 'Kan forklare API-design' },
    ]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to the student progression page for students', () => {
    const authService = TestBed.inject(AuthService) as {
      currentUser: { id: string; role: string };
    };
    authService.currentUser = { id: 'student-1', role: 'student' };

    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.viewStudentProgression();

    expect(component.isStudent).toBe(true);
    expect(navigateSpy).toHaveBeenCalledWith(['/progress/students/student-1/subjects/subject-1']);
  });
});
