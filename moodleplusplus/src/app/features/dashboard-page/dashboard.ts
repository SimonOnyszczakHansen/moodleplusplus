import { Component, OnInit } from '@angular/core';
import { StudentContent } from './components/student-content/student-content';
import { TeacherContent } from './components/teacher-content/teacher-content';
import { IDashboard } from './models/dashboard.model';
import { DashboardService } from './services/dashboard';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.interface';

@Component({
  selector: 'app-dashboard',
  imports: [StudentContent, TeacherContent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit{
	userRole?: User['role'];
	dashboard?: IDashboard;

	constructor(private dashboardService: DashboardService, private auth: AuthService) {}

	ngOnInit(): void {
		this.userRole = this.auth.currentUser?.role;

		this.dashboardService.getDashboardData().subscribe(data => {
			this.dashboard = data;
		});
	}

}
