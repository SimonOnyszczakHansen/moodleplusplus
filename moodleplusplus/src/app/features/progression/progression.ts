import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProgressionService } from '../../core/services/Progression/progression-service';
import { AuthService } from '../../core/services/auth.service';
import {
  IStudentSubjectProgress,
  ProgressionTaskStatus,
  ProgressionQuizStatus,
} from '../../core/models/allstudentsprogress.model';
import { ProgressBar } from '../../shared/progress-bar/progress-bar';
import { Table, TableCellTemplate } from '../../shared/table/table';
import { StatusBadge, StatusVariantTask, StatusVariantQuiz } from '../../shared/status-badge/status-badge';
import { DecimalPipe } from '@angular/common';

const STATUS_BADGE_TASK: Record<ProgressionTaskStatus, StatusVariantTask> = {
  NotSubmitted: 'Ikke afleveret',
  Submitted: 'Afleveret',
  Approved: 'Godkendt',
  Rejected: 'Ikke godkendt',
};

const STATUS_BADGE_QUIZ: Record<ProgressionQuizStatus, StatusVariantQuiz> = {
  Available: 'Tilgængelig',
  Passed: 'Bestået',
  Failed: 'Fejlet',
};

@Component({
  selector: 'app-progression',
  imports: [ProgressBar, Table, TableCellTemplate, StatusBadge, DecimalPipe],
  templateUrl: './progression.html',
  styleUrl: './progression.css',
})
export class Progression implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  readonly progress = signal<IStudentSubjectProgress | null>(null);

  constructor(private progressionService: ProgressionService) {}

  ngOnInit(): void {
    const studentId = this.authService.currentUser?.id ?? '';
    const subjectId = this.route.snapshot.paramMap.get('subjectId') ?? '';
    this.loadProgressionData(studentId, subjectId);
  }

  statusLabelTask(status: ProgressionTaskStatus): StatusVariantTask {
    return STATUS_BADGE_TASK[status];
  }

  statusLabelQuiz(status: ProgressionQuizStatus): StatusVariantQuiz {
    return STATUS_BADGE_QUIZ[status];
  }

  private loadProgressionData(studentId: any, subjectId: string): void {
    this.progressionService
      .getStudentSubjectProgress(studentId, subjectId)
      .subscribe((data: IStudentSubjectProgress) => {
        this.progress.set(data);
        console.log(data);
      });
  }
}
