import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Task as TaskService } from '../services/task';
import { ITaskAssignmentDetail } from '../models/task.model';
import { MOCK_TASK_ASSIGNMENT_DETAILS } from '../models/task-details.mock';
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
        return this.assignment?.status === 'ikke afleveret';
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
        this.error = false;
        of(MOCK_TASK_ASSIGNMENT_DETAILS[this.assignmentId]).subscribe({
            next: (assignment) => {
                this.assignment = assignment ?? null;
                this.error = !assignment;
            },
        });

        // this.taskService.getAssignment(this.assignmentId).subscribe({
        //     next: (assignment) => {
        //         this.assignment = assignment;
        //     },
        //     error: () => {
        //         this.error = true;
        //     },
        // });
    }
}