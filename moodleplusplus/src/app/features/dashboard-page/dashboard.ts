import { Component, OnInit, signal } from '@angular/core';
import { StudentContent } from './components/student-content/student-content';
import { TeacherContent } from './components/teacher-content/teacher-content';
import { IDashboard } from './models/dashboard.model';
import { DashboardService } from './services/dashboard';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [StudentContent, TeacherContent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})

export class Dashboard implements OnInit {
  userRole = signal<string | undefined>(undefined);
  dashboard = signal<IDashboard | undefined>(undefined);

  constructor(
    private dashboardService: DashboardService,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.userRole.set(this.auth.currentUser?.role);

    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboard.set(data);
      },
      error: (err) => console.error('Dashboard fetch failed:', err),
    });
  }
}
