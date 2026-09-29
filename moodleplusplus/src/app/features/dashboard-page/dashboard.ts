import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { SubjectList } from '../subject-page/components/subject-list/subject-list';

@Component({
  selector: 'app-dashboard',
  imports: [SubjectList],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  userRole?: string;
  userName?: string;

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const role = this.auth.currentUser?.role;
    const roleNames: Record<string, string> = {
      '1': 'administrator',
      '2': 'teacher',
      '3': 'student',
    };
    this.userRole =
      role === undefined
        ? undefined
        : (roleNames[String(role).toLowerCase()] ?? String(role).toLowerCase());
  }

  viewAllSubjects() {
    this.router.navigate(['/subjects']);
  }

  viewAllTasks() {
    this.router.navigate(['/tasks']);
  }
}
