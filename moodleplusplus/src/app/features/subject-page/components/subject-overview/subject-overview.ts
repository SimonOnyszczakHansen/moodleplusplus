import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { Button } from '../../../../shared/button/button';
import { ISubject, ISubjectGoal } from '../../models/subjects.model';
import { SubjectsService } from '../../services/subjects';

@Component({
  selector: 'app-subject-overview',
  imports: [CommonModule, Button],
  templateUrl: './subject-overview.html',
  styleUrl: './subject-overview.css',
})
export class SubjectOverview implements OnInit {
  subject: ISubject | null = null;
  goals: ISubjectGoal[] = [];
  students = [
    { name: 'John', email: 'John@zbc.dk' },
    { name: 'Maja', email: 'maja@zbc.dk' },
    { name: 'Nicolai', email: 'nicolai@zbc.dk' },
    { name: 'Sofia', email: 'sofia@zbc.dk' },
  ];
  tasks = [
    { title: 'Web API', due: '14. maj', status: 'Aktiv' },
    { title: 'Datamodels', due: '22. maj', status: 'Udfordrende' },
  ];

  constructor(
    private route: ActivatedRoute,
    private subjectsService: SubjectsService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const subjectId = this.route.snapshot.paramMap.get('id')!;

    this.subjectsService.getSubjectById(subjectId).subscribe((subject) => {
      this.subject = subject;
    });

    this.subjectsService.getGoalsBySubjectId(subjectId).subscribe((goals) => {
      this.goals = goals;
    });
  }

  get subjectTitle(): string {
    return this.subject?.name ?? 'Programmering';
  }

  get isTeacher(): boolean {
    return this.authService.currentUser?.role === 'teacher';
  }
}
