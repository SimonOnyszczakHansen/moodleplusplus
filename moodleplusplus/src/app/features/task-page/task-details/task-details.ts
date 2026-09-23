import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task as TaskService } from '../services/task';
import { AuthService } from '../../../core/services/auth.service';
import { ITaskAssignmentDetail } from '../models/task.model';
import { StatusBadge } from '../../../shared/status-badge/status-badge';
import { Button } from '../../../shared/button/button';

@Component({
  selector: 'app-task-details',
  imports: [StatusBadge, Button, DatePipe, FormsModule, RouterLink],
  templateUrl: './task-details.html',
  styleUrl: './task-details.css',
})
export class TaskDetails implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly taskService = inject(TaskService);
    private readonly authService = inject(AuthService);

    assignment: ITaskAssignmentDetail | null = null;
    error = false;

    comment = '';
    selectedFile: File | null = null;
    submitting = false;
    submitError = false;

    private assignmentId = '';

    ngOnInit(): void {
        this.assignmentId = this.route.snapshot.paramMap.get('assignmentId') ?? '';
        this.load();
    }

    get canSubmit(): boolean {
        return this.assignment?.status === 'Ikke afleveret';
    }

    get submissionFileUrl(): string {
        return this.taskService.getSubmissionFileUrl(this.assignmentId);
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.selectedFile = input.files?.[0] ?? null;
    }

    onSubmit(): void {
        this.submitting = true;
        this.submitError = false;
        this.taskService.submitAssignment(this.assignmentId, this.comment, this.selectedFile ?? undefined).subscribe({
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
        this.taskService.getAssignment(this.assignmentId).subscribe({
            next: (assignment) => {
                this.assignment = { ...assignment, submission: null, feedback: [], objectives: [] };
                this.error = false;
        
                this.taskService.getSubmission(this.assignmentId).subscribe({
                    next: (submission) => { if (this.assignment) this.assignment.submission = submission; },
                });
        
                const studentId = this.authService.currentUser?.id;
                if (studentId) {
                    this.taskService.getFeedback(String(studentId), assignment.taskId).subscribe({
                        next: (feedback) => { if (this.assignment) this.assignment.feedback = feedback; },
                    });
                }
                // No confirmed endpoint yet for fetching this assignment's objectives from the student side - ask backend.
            },
            error: () => { this.error = true; },
        });
    }
}