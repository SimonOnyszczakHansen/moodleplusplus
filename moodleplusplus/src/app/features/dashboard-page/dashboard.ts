import { Component, OnInit, signal } from '@angular/core';
import { IDashboard } from './models/dashboard.model';
import { DashboardService } from './services/dashboard';
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
  userRole = signal<string | undefined>(undefined);
  dashboard = signal<IDashboard | undefined>(undefined);

  constructor(
    private auth: AuthService,
    private router: Router,
    private dashboardService: DashboardService,
  ) {}

  ngOnInit(): void {
    const role = this.auth.currentUser?.role;
    const roleNames: Record<string, string> = {
      '1': 'administrator',
      '2': 'teacher',
      '3': 'student',
    };
    this.userRole.set(
      role === undefined
        ? undefined
        : (roleNames[String(role).toLowerCase()] ?? String(role).toLowerCase()),
    );

    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboard.set(data);
      },
      error: (err) => console.error('Dashboard fetch failed:', err),
    });
  }
}
