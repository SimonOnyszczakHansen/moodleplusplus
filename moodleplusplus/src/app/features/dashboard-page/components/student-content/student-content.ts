import { Component } from '@angular/core';
import { Card } from '../../../../shared/card/card';
import { CommonModule } from '@angular/common';
import { ProgressBar } from '../../../../shared/progress-bar/progress-bar';
import { Button } from '../../../../shared/button/button';
import { OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard';
import { Router } from '@angular/router';
import { ITask } from '../../models/task.model';
import { IQuiz } from '../../models/quiz.model';
import { StudentSubjects } from '../../../subject-page/components/student-subjects/student-subjects';

@Component({
  selector: 'app-student-content',
  imports: [CommonModule, Card, ProgressBar, Button, StudentSubjects],
  templateUrl: './student-content.html',
  styleUrl: './student-content.css',
})
export class StudentContent implements OnInit {
  tasks: ITask[] = [];
  quizzes: IQuiz[] = [];

  constructor(
    private dashboard: DashboardService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.dashboard.getDashboardData().subscribe((data) => {
      this.tasks = data.tasks;
      this.quizzes = data.quizzes;
    });
  }

  get pendingTasks(): ITask[] {
    return this.tasks
      .filter((t) => t.status === 'ikke afleveret' || t.status === 'afvist')
      .filter((t) => new Date(t.deadline) >= new Date())
      .slice(0, 8);
  }

  viewAllSubjects() {
    this.router.navigate(['/subjects']);
  }

  viewAllTasks() {
    this.router.navigate(['/tasks']);
  }
}
