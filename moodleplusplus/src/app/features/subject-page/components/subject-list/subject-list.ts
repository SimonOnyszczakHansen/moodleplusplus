import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

// Services
import { AuthService } from '../../../../core/services/auth.service';
import { SubjectsService } from '../../../../core/services/subjects/subjects.service';
import { ProgressionService } from '../../../../core/services/Progression/progression-service';

// Shared
import { Card } from '../../../../shared/card/card';
import { ProgressBar } from '../../../../shared/progress-bar/progress-bar';
import { Button } from '../../../../shared/button/button';

// Models
import { ISubject } from '../../../../core/models/subjects.model';
import { IStudentSubjectProgress } from '../../../../core/models/allstudentsprogress.model';

interface SubjectWithProgress extends ISubject {
  subjectProgress: number;
}

@Component({
  selector: 'app-subject-list',
  imports: [CommonModule, Card, ProgressBar, Button],
  templateUrl: './subject-list.html',
  styleUrl: './subject-list.css',
})
export class SubjectList implements OnInit {
  subjects = signal<SubjectWithProgress[]>([]);

  constructor(
    private router: Router,
    private authService: AuthService,
    private subjectsService: SubjectsService,
    private progressionService: ProgressionService,
  ) {}

  get isTeacher(): boolean {
    return this.authService.currentUser?.role === 'teacher';
  }

  ngOnInit() {
    this.loadSubjects();
    this.subjectsService.refresh$.subscribe(() => this.loadSubjects());
  }

  private loadSubjects() {
    this.subjectsService.getMySubjects().subscribe({
      next: (subjects) => {
        this.loadSubjectsWithProgress(subjects);
      },
      error: (err) => {
        console.error('Subjects fetch failed:', err);
      },
    });
  }

  private loadSubjectsWithProgress(subjects: ISubject[]) {
    const studentId = this.authService.currentUser?.id;

    if (!studentId) {
      console.error('No logged-in student found');

      this.subjects.set(
        subjects.map((subject) => ({
          ...subject,
          subjectProgress: 0,
        })),
      );

      return;
    }

    if (subjects.length === 0) {
      this.subjects.set([]);
      return;
    }

    const progressRequests = subjects.map((subject) =>
      this.progressionService
        .getStudentSubjectProgress(studentId.toString(), subject.id.toString())
        .pipe(
          map((progress: IStudentSubjectProgress) => ({
            ...subject,
            subjectProgress: progress.completionPercentage,
          })),
          catchError((err) => {
            console.error(`Failed to load progress for subject ${subject.id}:`, err);

            return of({
              ...subject,
              subjectProgress: 0,
            });
          }),
        ),
    );

    forkJoin(progressRequests).subscribe({
      next: (subjectsWithProgress) => {
        this.subjects.set(subjectsWithProgress);
      },
      error: (err) => {
        console.error('Failed to load subject progress:', err);
      },
    });
  }

  viewSubject(subjectId: string | number) {
    this.router.navigate(['/subject', subjectId]);
  }
}
