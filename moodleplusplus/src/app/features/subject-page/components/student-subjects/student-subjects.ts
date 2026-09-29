import { Component, OnInit } from '@angular/core';
import { SubjectsService } from '../../services/subjects';
import { Router } from '@angular/router';
import { Card } from '../../../../shared/card/card';
import { CommonModule } from '@angular/common';
import { ProgressBar } from '../../../../shared/progress-bar/progress-bar';
import { Button } from '../../../../shared/button/button';
import { ISubject } from '../../models/subjects.model';

@Component({
  selector: 'app-student-subjects',
  imports: [CommonModule, Card, ProgressBar, Button],
  templateUrl: './student-subjects.html',
  styleUrl: './student-subjects.css',
})
export class StudentSubjects implements OnInit {
  subjects: ISubject[] = [];

  constructor(
    private subjectsService: SubjectsService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.subjectsService.getSubjectsData().subscribe((data) => {
      this.subjects = data;
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
