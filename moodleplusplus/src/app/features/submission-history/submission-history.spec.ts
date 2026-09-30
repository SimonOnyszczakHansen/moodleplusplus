import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { SubmissionHistory } from './submission-history';
import { Task as TaskService } from '../task-page/services/task';
import { AuthService } from '../../core/services/auth.service';
import { IFeedbackEntry } from '../task-page/models/task.model';

describe('SubmissionHistory', () => {
	let component: SubmissionHistory;
	let fixture: ComponentFixture<SubmissionHistory>;
	let taskService: { getFeedback: ReturnType<typeof vi.fn> };
	let router: { navigateByUrl: ReturnType<typeof vi.fn> };
	let authService: { currentUser: { id: string } | null };

	const feedbackEntries: IFeedbackEntry[] = [
		{ text: 'Godt gået', createdAt: '2026-02-01T10:00:00Z', teacherName: 'Anna' },
		{ text: 'Prøv igen', createdAt: '2026-01-01T10:00:00Z', teacherName: 'Bo' },
	];

	function configure(params: Record<string, string>, queryParams: Record<string, string>): void {
		taskService = { getFeedback: vi.fn(() => of(feedbackEntries)) };
		router = { navigateByUrl: vi.fn() };
		authService = { currentUser: { id: 'current-user-id' } };

		TestBed.configureTestingModule({
			imports: [SubmissionHistory],
			providers: [
				{ provide: TaskService, useValue: taskService },
				{ provide: Router, useValue: router },
				{ provide: AuthService, useValue: authService },
				{
					provide: ActivatedRoute,
					useValue: {
						snapshot: {
							paramMap: convertToParamMap(params),
							queryParamMap: convertToParamMap(queryParams),
						},
					},
				},
			],
		});

		fixture = TestBed.createComponent(SubmissionHistory);
		component = fixture.componentInstance;
	}

	it('fetches feedback for the studentId from the query params and sorts it oldest-first', () => {
		// Arrange
		configure({ taskId: 'task-1' }, { studentId: 'student-1', name: 'Gruppe2' });

		// Act
		fixture.detectChanges();

		// Assert
		expect(taskService.getFeedback).toHaveBeenCalledWith('student-1', 'task-1');
		expect(component.sortedFeedback.map((entry) => entry.text)).toEqual(['Prøv igen', 'Godt gået']);
		expect(component.loadError()).toBe(false);
	});

	it('falls back to the current user id when no studentId query param is present', () => {
		// Arrange
		configure({ taskId: 'task-1' }, {});

		// Act
		fixture.detectChanges();

		// Assert
		expect(taskService.getFeedback).toHaveBeenCalledWith('current-user-id', 'task-1');
	});

	it('defaults the display name to "dig" when no name query param is present', () => {
		// Arrange
		configure({ taskId: 'task-1' }, {});

		// Act
		fixture.detectChanges();

		// Assert
		expect(component.name).toBe('dig');
	});

	it('sets loadError and skips the request when no studentId can be resolved', () => {
		// Arrange
		configure({ taskId: 'task-1' }, {});
		authService.currentUser = null;

		// Act
		fixture.detectChanges();

		// Assert
		expect(taskService.getFeedback).not.toHaveBeenCalled();
		expect(component.loadError()).toBe(true);
	});

	it('sets loadError when the feedback request fails', () => {
		// Arrange
		configure({ taskId: 'task-1' }, { studentId: 'student-1' });
		taskService.getFeedback.mockReturnValue(throwError(() => new Error('network error')));

		// Act
		fixture.detectChanges();

		// Assert
		expect(component.loadError()).toBe(true);
	});

	it('shows the empty state when there is no feedback yet', () => {
		// Arrange
		configure({ taskId: 'task-1' }, { studentId: 'student-1' });
		taskService.getFeedback.mockReturnValue(of([]));

		// Act
		fixture.detectChanges();
		const element: HTMLElement = fixture.nativeElement;

		// Assert
		expect(element.querySelector('.no-content-text')?.textContent).toContain('Ingen feedback endnu');
	});

	it('renders one round per feedback entry with its text and teacher name', () => {
		// Arrange
		configure({ taskId: 'task-1' }, { studentId: 'student-1' });

		// Act
		fixture.detectChanges();
		const element: HTMLElement = fixture.nativeElement;
		const rounds = element.querySelectorAll('.feedback-round');

		// Assert
		expect(rounds).toHaveLength(2);
		expect(rounds[0].textContent).toContain('Aflevering 1');
		expect(rounds[0].textContent).toContain('Prøv igen');
		expect(rounds[0].textContent).toContain('Bo');
		expect(rounds[1].textContent).toContain('Aflevering 2');
		expect(rounds[1].textContent).toContain('Godt gået');
	});

	it('navigates back to the returnTo query param when going back', () => {
		// Arrange
		configure({ taskId: 'task-1' }, { studentId: 'student-1', returnTo: '/tasks/task-1' });
		fixture.detectChanges();

		// Act
		component.goBack();

		// Assert
		expect(router.navigateByUrl).toHaveBeenCalledWith('/tasks/task-1');
	});

	it('defaults goBack to /dashboard when no returnTo query param is present', () => {
		// Arrange
		configure({ taskId: 'task-1' }, { studentId: 'student-1' });
		fixture.detectChanges();

		// Act
		component.goBack();

		// Assert
		expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
	});
});
