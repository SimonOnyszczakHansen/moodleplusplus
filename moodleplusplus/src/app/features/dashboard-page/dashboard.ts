import { Component, OnInit, computed, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DashboardResponse } from './models/dashboard.model';
import { DashboardService } from './services/dashboard';
import { RouterLink } from '@angular/router';
import { Observable, catchError, combineLatest, map, of, switchMap } from 'rxjs';
import { SubjectsService } from '../../core/services/subjects/subjects.service';
import { ISubject } from '../../core/models/subjects.model';
import { IDashboardTaskPreview } from './models/task.model';
import { IDashboardQuiz } from './models/quiz.model';
import { ProgressBar } from '../../shared/progress-bar/progress-bar';
import { Card } from '../../shared/card/card';
import { Button } from '../../shared/button/button';

@Component({
  selector: 'app-dashboard',
  imports: [ProgressBar, DatePipe, RouterLink, Card, Button],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  dashboard = signal<DashboardResponse | undefined>(undefined);
  isTeacherDashboard = computed(() => {
    const data = this.dashboard();
    return !!data && 'assignments' in data;
  });
  userName = computed(() => {
    const data = this.dashboard();
    return data && ('teacherName' in data ? data.teacherName : data.studentName);
  });
  hasMoreAssignments = computed(() => {
    const data = this.dashboard();
    return (
      !!data && 'assignments' in data && data.assignments.totalCount > data.assignments.items.length
    );
  });
  subjects = signal<ISubject[]>([]);
  tasks = signal<IDashboardTaskPreview[]>([]);
  quizzes = signal<IDashboardQuiz[]>([]);
  loading = signal(true);
  error = signal(false);
  subjectsError = signal(false);
  pendingTasks = computed(() =>
    this.tasks()
      .filter((task) => task.status === 'NotSubmitted' || task.status === 'Rejected')
      .sort((a, b) => {
        const first = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const second = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        return first - second;
      }),
  );
  subjectCards = computed(() =>
    this.subjects().map((subject) => {
      const tasks = this.tasks().filter((task) => task.subjectId === String(subject.id));

      if (!this.isTeacherDashboard()) {
        const quizzes = this.quizzes().filter((quiz) => quiz.subjectId === String(subject.id));
        const approvedTasks = tasks.filter((task) => task.status === 'Approved').length;
        const passedQuizzes = quizzes.filter((quiz) => quiz.passed).length;
        const assigned = tasks.length + quizzes.length;
        const approved = approvedTasks + passedQuizzes;
        return {
          ...subject,
          assigned,
          approved,
          progress: assigned ? Math.round((approved / assigned) * 100) : 0,
        };
      }

      // Teacher assignments fan out one row per student - dedupe by taskId so "assigned" counts tasks, not rows.
      const approvedByTaskId = new Map<string, boolean>();
      for (const task of tasks) {
        approvedByTaskId.set(
          task.taskId,
          (approvedByTaskId.get(task.taskId) ?? true) && task.status === 'Approved',
        );
      }
      const assigned = approvedByTaskId.size;
      const approved = Array.from(approvedByTaskId.values()).filter(Boolean).length;
      return {
        ...subject,
        assigned,
        approved,
        progress: assigned ? Math.round((approved / assigned) * 100) : 0,
      };
    }),
  );
  subjectNames = computed(
    () => new Map(this.subjects().map((subject) => [String(subject.id), subject.name])),
  );

  constructor(
    private dashboardService: DashboardService,
    private subjectsService: SubjectsService,
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.error.set(false);
    this.subjectsError.set(false);
    combineLatest({
      data: this.dashboardService.getDashboardData(),
      subjects: this.subjectsService.getMySubjects().pipe(
        catchError(() => {
          // A subject permission error must not abort the in-flight dashboard request.
          this.subjectsError.set(true);
          return of<ISubject[]>([]);
        }),
      ),
    })
      .pipe(
        switchMap(({ data, subjects }) => {
          // Teacher tasks are definitions; submission statuses belong to assignments.
          // Keep teacher pagination separate from the student's /task-assignments/me fallback.
          if ('assignments' in data) {
            return of({ data, subjects, tasks: data.assignments.items });
          }
          const tasks: Observable<IDashboardTaskPreview[]> =
            data.tasks.totalCount > data.tasks.items.length
              ? this.dashboardService.getAllTasks()
              : of(data.tasks.items);
          return tasks.pipe(map((tasks) => ({ data, subjects, tasks })));
        }),
      )
      .subscribe({
        next: ({ data, subjects, tasks }) => {
          this.dashboard.set(data);
          this.subjects.set(subjects);
          this.tasks.set(tasks);
          this.quizzes.set('quizzes' in data ? data.quizzes?.items ?? [] : []);
          this.loading.set(false);
        },
        error: () => {
          this.error.set(true);
          this.loading.set(false);
        },
      });
  }
}
