import { Component, OnInit } from '@angular/core';
import { Card } from '../../../../shared/card/card';
import { CommonModule } from '@angular/common';
import { Button } from '../../../../shared/button/button';
import { DashboardService } from '../../services/dashboard';
import { Router } from '@angular/router';
import { ITask } from '../../models/task.model';
import { TeacherSubjects } from '../../../subject-page/components/teacher-subjects/teacher-subjects';

@Component({
  selector: 'app-teacher-content',
  imports: [CommonModule, Card, Button, TeacherSubjects],
  templateUrl: './teacher-content.html',
  styleUrl: './teacher-content.css',
})
export class TeacherContent implements OnInit {
  tasks: ITask[] = [];

  constructor(
    private dashboard: DashboardService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.dashboard.getDashboardData().subscribe((data) => {
      this.tasks = data.tasks;
    });
  }

  get upcomingTasks(): ITask[] {
    return this.tasks.filter((t) => new Date(t.deadline) >= new Date()).slice(0, 8);
  }

  viewAllSubjects() {
    this.router.navigate(['/subjects']);
  }

  viewAllTasks() {
    this.router.navigate(['/tasks']);
  }
}
