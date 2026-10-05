import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { Progression } from './progression';
import { ProgressionService } from '../../core/services/Progression/progression-service';
import { AuthService } from '../../core/services/auth.service';
import { IStudentSubjectProgress } from '../../core/models/allstudentsprogress.model';

describe('Progression', () => {
  let component: Progression;
  let fixture: ComponentFixture<Progression>;
  let progressionService: { getStudentSubjectProgress: ReturnType<typeof vi.fn> };
  let authService: { currentUser: { id: string } | null };

  const mockProgress: IStudentSubjectProgress = {
    studentId: 'student-1',
    studentName: 'Simon',
    subject: { id: 'subject-1', name: 'OOP', createdAt: '2026-01-01T00:00:00Z', createdBy: 'teacher-1' },
    completionPercentage: 50,
    summary: {
      tasks: { assigned: 2, approved: 1, awaitingReview: 0, rejected: 0, notSubmitted: 1, completionPercentage: 50 },
      quizzes: { assigned: 1, completed: 0, passed: 0, failed: 0, completionPercentage: 0 },
    },
    tasks: [
      {
        assignmentId: 'assignment-1',
        taskId: 'task-1',
        title: 'OOP Opgave',
        subjectId: 'subject-1',
        recipientType: 'student',
        groupId: null,
        status: 'Approved',
        assignedAt: '2026-01-01T00:00:00Z',
        deadline: '2026-02-01T00:00:00Z',
        submittedAt: '2026-01-15T00:00:00Z',
        feedbackCount: 1,
      },
    ],
    quizzes: [
      {
        quizId: 'quiz-1',
        title: 'OOP Quiz',
        subjectId: 'subject-1',
        assignedAt: '2026-01-01T00:00:00Z',
        completedAt: null,
        scorePercentage: null,
        passed: null,
        status: 'Available',
      },
    ],
  };

  function configure(subjectId: string | null, currentUser: { id: string } | null): void {
    progressionService = { getStudentSubjectProgress: vi.fn(() => of(mockProgress)) };
    authService = { currentUser };

    TestBed.configureTestingModule({
      imports: [Progression],
      providers: [
        { provide: ProgressionService, useValue: progressionService },
        { provide: AuthService, useValue: authService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap(subjectId ? { subjectId } : {}),
            },
          },
        },
      ],
    });

    fixture = TestBed.createComponent(Progression);
    component = fixture.componentInstance;
  }

  it('fetches progress for the current user and the subjectId route param', () => {
    // Arrange
    configure('subject-1', { id: 'student-1' });

    // Act
    fixture.detectChanges();

    // Assert
    expect(progressionService.getStudentSubjectProgress).toHaveBeenCalledWith('student-1', 'subject-1');
  });

  it('falls back to an empty studentId when no current user is set', () => {
    // Arrange
    configure('subject-1', null);

    // Act
    fixture.detectChanges();

    // Assert
    expect(progressionService.getStudentSubjectProgress).toHaveBeenCalledWith('', 'subject-1');
  });

  it('falls back to an empty subjectId when no route param is present', () => {
    // Arrange
    configure(null, { id: 'student-1' });

    // Act
    fixture.detectChanges();

    // Assert
    expect(progressionService.getStudentSubjectProgress).toHaveBeenCalledWith('student-1', '');
  });

  it('sets the progress signal with the data returned by the service', () => {
    // Arrange
    configure('subject-1', { id: 'student-1' });

    // Act
    fixture.detectChanges();

    // Assert
    expect(component.progress()).toEqual(mockProgress);
  });

  it('renders the subject name and completion percentage in the header card', () => {
    // Arrange
    configure('subject-1', { id: 'student-1' });

    // Act
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;

    // Assert
    expect(element.querySelector('.header-title')?.textContent).toContain('OOP');
    expect(element.querySelector('.stat-value')?.textContent).toContain('50');
  });

  it('maps each task status to the correct Danish badge label', () => {
    // Arrange
    configure('subject-1', { id: 'student-1' });

    // Act
    const labels = (['NotSubmitted', 'Submitted', 'Approved', 'Rejected'] as const).map((status) =>
      component.statusLabelTask(status),
    );

    // Assert
    expect(labels).toEqual(['Ikke afleveret', 'Afleveret', 'Godkendt', 'Afvist']);
  });

  it('maps each quiz status to the correct Danish badge label', () => {
    // Arrange
    configure('subject-1', { id: 'student-1' });

    // Act
    const labels = (['Available', 'Passed', 'Failed'] as const).map((status) => component.statusLabelQuiz(status));

    // Assert
    expect(labels).toEqual(['Tilgængelig', 'Bestået', 'Fejlet']);
  });
});