import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task as TaskService } from '../../../task-page/services/task';
import { ITaskAssignmentDetail } from '../../../task-page/models/task.model';
import { AuthService } from '../../../../core/services/auth.service';
import { StatusBadge } from '../../../../shared/status-badge/status-badge';
import { Button } from '../../../../shared/button/button';

@Component({
	selector: 'app-student-task-details',
	imports: [StatusBadge, Button, DatePipe, FormsModule, RouterLink],
	templateUrl: './student-task-details.html',
	styleUrl: './student-task-details.css',
})
export class StudentTaskDetails implements OnInit {
	private readonly route = inject(ActivatedRoute);
	private readonly taskService = inject(TaskService);
	private readonly authService = inject(AuthService);

	assignment = signal<ITaskAssignmentDetail | null>(null);
	error = signal(false);
	downloadingFile = signal(false);

	comment = '';
	selectedFile: File | null = null;
	submitting = signal(false);
	submitError = signal(false);
	attemptedEmptySubmit = signal(false);

	private id = '';

	ngOnInit(): void {
		this.id = this.route.snapshot.paramMap.get('id') ?? '';
		this.load();
	}

	get canSubmit(): boolean {
		return this.assignment()?.status === 'Ikke afleveret';
	}

	get hasNothingToSubmit(): boolean {
		return !this.comment.trim() && !this.selectedFile;
	}

	get submissionFileUrl(): string {
		return this.taskService.getSubmissionFileUrl(this.id);
	}

	onFileSelected(event: Event): void {
		const input = event.target as HTMLInputElement;
		this.selectedFile = input.files?.[0] ?? null;
	}

	onDownloadFile(fileName: string): void {
		this.downloadingFile.set(true);
		this.taskService.downloadSubmissionFile(this.id).subscribe({
			next: (blob) => {
				this.downloadingFile.set(false);
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = fileName;
				a.click();
				URL.revokeObjectURL(url);
			},
			error: () => this.downloadingFile.set(false),
		});
	}

	onSubmit(): void {
		if (this.hasNothingToSubmit) {
			this.attemptedEmptySubmit.set(true);
			return;
		}

		this.attemptedEmptySubmit.set(false);
		this.submitting.set(true);
		this.submitError.set(false);
		this.taskService.submitAssignment(this.id, this.comment, this.selectedFile ?? undefined).subscribe({
			next: () => {
				this.submitting.set(false);
				this.comment = '';
				this.selectedFile = null;
				this.load();
			},
			error: () => {
				this.submitting.set(false);
				this.submitError.set(true);
			},
		});
	}

	private load(): void {
		this.error.set(false);

		this.taskService.getAssignment(this.id).subscribe({
			next: (assignment) => {
				this.assignment.set({ ...assignment, submission: null, feedback: [], objectives: [] });
				this.error.set(false);

				this.taskService.getSubmission(this.id).subscribe({
					next: (submission) => {
						const current = this.assignment();
						if (current) this.assignment.set({ ...current, submission });
					},
				});

				const studentId = this.authService.currentUser?.id;
				if (studentId) {
					this.taskService.getFeedback(String(studentId), assignment.taskId).subscribe({
						next: (feedback) => {
							const current = this.assignment();
							if (current) this.assignment.set({ ...current, feedback });
						},
					});
				}
			},
			error: () => { this.error.set(true); },
		});
	}
}
