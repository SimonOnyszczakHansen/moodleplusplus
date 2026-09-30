import { Component, OnInit, signal } from '@angular/core';
import { SubjectsService } from '../../services/subjects';
import { Router } from '@angular/router';
import { Card } from '../../../../shared/card/card';
import { CommonModule } from '@angular/common';
import { ProgressBar } from '../../../../shared/progress-bar/progress-bar';
import { Button } from '../../../../shared/button/button';
import { ISubject } from '../../models/subjects.model';

@Component({
  selector: 'app-subject-list',
  imports: [CommonModule, Card, ProgressBar, Button],
  templateUrl: './subject-list.html',
  styleUrl: './subject-list.css',
})
export class SubjectList implements OnInit {
  subjects = signal<ISubject[]>([]);

  constructor(
    private subjectsService: SubjectsService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadSubjects();
    this.subjectsService.refresh$.subscribe(() => this.loadSubjects());
  }

  private loadSubjects() {
    this.subjectsService.getMySubjects().subscribe({
      next: (subjects) => {
        this.subjects.set(subjects);
      },
      error: (err) => console.error('Subjects fetch failed:', err),
    });
  }

  viewSubject(subjectId: string | number) {
    this.router.navigate(['/subject', subjectId]);
  }

  // getSubjectName(subjectId: string | number): string {
  //   return this.subjects.find((s) => s.id === subjectId)?.name ?? '';
  // }

  getSubjectProgress(subjectId: string | number): number {
    return 40;
    // const subjectQuizzes = this.quizzes.filter((q) => q.subjectId === subjectId);
    // const subjectTasks = this.tasks.filter((t) => t.subjectId === subjectId);

    // const quizRatio = subjectQuizzes.length
    //   ? subjectQuizzes.filter((q) => q.passed).length / subjectQuizzes.length
    //   : 0;

    // const taskRatio = subjectTasks.length
    //   ? subjectTasks.filter((t) => t.status === 'godkendt').length / subjectTasks.length
    //   : 0;

    // return Math.round(((quizRatio + taskRatio) / 2) * 100);
  }
}
