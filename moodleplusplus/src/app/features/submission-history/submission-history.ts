import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TasksService } from '../../core/services/tasks/tasks.service';
import { IFeedbackEntry } from '../../core/models/tasks.model';
import { AuthService } from '../../core/services/auth.service';
import { Button } from '../../shared/button/button';

@Component({
  selector: 'app-submission-history',
  imports: [DatePipe, Button],
  templateUrl: './submission-history.html',
  styleUrl: './submission-history.css',
})
export class SubmissionHistory implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly taskService = inject(TasksService);
  private readonly authService = inject(AuthService);

  name = '';
  feedback = signal<IFeedbackEntry[]>([]);
  loadError = signal(false);

  private returnTo = '/dashboard';

  ngOnInit(): void {
    const taskId = this.route.snapshot.paramMap.get('taskId') ?? '';
    const query = this.route.snapshot.queryParamMap;

    this.name = query.get('name') ?? 'dig';
    this.returnTo = query.get('returnTo') ?? '/dashboard';
    const currentUserId = this.authService.currentUser?.id;
    const studentId = query.get('studentId') ?? (currentUserId ? String(currentUserId) : null);

    if (!studentId) {
      this.loadError.set(true);
      return;
    }

    this.taskService.getFeedback(studentId, taskId).subscribe({
      next: (feedback) => this.feedback.set(feedback),
      error: () => this.loadError.set(true),
    });
  }

  // Feedback rounds accumulate over time (unlike the submission itself, which is overwritten on resubmit) - oldest first.
  get sortedFeedback(): IFeedbackEntry[] {
    return [...this.feedback()].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }

  goBack(): void {
    this.router.navigateByUrl(this.returnTo);
  }
}
