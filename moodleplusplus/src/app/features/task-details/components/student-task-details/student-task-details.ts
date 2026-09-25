import { Component, OnInit, inject } from '@angular/core';
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

    assignment: ITaskAssignmentDetail | null = null;
    error = false;

    comment = '';
    selectedFile: File | null = null;
    submitting = false;
    submitError = false;

    private id = '';

    ngOnInit(): void {
        this.id = this.route.snapshot.paramMap.get('id') ?? '';
        this.load();
    }

    get canSubmit(): boolean {
        return this.assignment?.status === 'Ikke afleveret';
    }

    get submissionFileUrl(): string {
        return this.taskService.getSubmissionFileUrl(this.id);
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.selectedFile = input.files?.[0] ?? null;
    }

    onSubmit(): void {
        this.submitting = true;
        this.submitError = false;
        this.taskService.submitAssignment(this.id, this.comment, this.selectedFile ?? undefined).subscribe({
            next: () => {
                this.submitting = false;
                this.comment = '';
                this.selectedFile = null;
                this.load();
            },
            error: () => {
                this.submitting = false;
                this.submitError = true;
            },
        });
    }

    private load(): void {
        this.error = false;

        this.taskService.getAssignment(this.id).subscribe({
            next: (assignment) => {
                this.assignment = { ...assignment, submission: null, feedback: [], objectives: [] };
                this.error = false;

                this.taskService.getSubmission(this.id).subscribe({
                    next: (submission) => { if (this.assignment) this.assignment.submission = submission; },
                });

                const studentId = this.authService.currentUser?.id;
                if (studentId) {
                    this.taskService.getFeedback(String(studentId), assignment.taskId).subscribe({
                        next: (feedback) => { if (this.assignment) this.assignment.feedback = feedback; },
                    });
                }
            },
            error: () => { this.error = true; },
        });
    }
}
