import { Component, OnInit, signal } from '@angular/core';
import { Card } from '../../../../shared/card/card';
import { CommonModule } from '@angular/common';
import { Button } from '../../../../shared/button/button';
import { DashboardService } from '../../services/dashboard';
import { Task } from '../../../task-page/services/task';
import { Router } from '@angular/router';
import { ISubject } from '../../models/subject.model';
import { IDashboardTask } from '../../models/task.model';

@Component({
	selector: 'app-teacher-content',
	imports: [CommonModule, Card, Button],
	templateUrl: './teacher-content.html',
	styleUrl: './teacher-content.css',
})
export class TeacherContent implements OnInit {
	subjects = signal<ISubject[]>([]);
	tasks = signal<IDashboardTask[]>([]);

	constructor(
		private dashboard: DashboardService,
		private taskService: Task,
		private router: Router,
	) { }

	ngOnInit() {
		this.taskService.getSubjects().subscribe({
			next: subjects => this.subjects.set(subjects),
			error: err => console.error('Subjects fetch failed:', err),
		});

		// NOTE: /dashboard/me is Student-only per the backend contract - this 403s for teachers.
		// A teacher-scoped dashboard endpoint (/dashboard/students) still needs to be wired up here.
		this.dashboard.getDashboardData().subscribe({
			next: data => {
				this.tasks.set(data.tasks.items);
			},
			error: err => console.error('Teacher dashboard fetch failed:', err),
		});
	}

	get upcomingTasks(): IDashboardTask[] {
		return this.tasks()
			.filter(t => !t.deadline || new Date(t.deadline) >= new Date())
			.slice(0, 8);
	}

	viewSubject(subjectid: string) {
		this.router.navigate(['/subject', subjectid]);
	}

	viewAllSubjects() {
		this.router.navigate(['/subjects']);
	}

	viewAllTasks() {
		this.router.navigate(['/tasks']);
	}

	getSubjectName(subjectId: string): string {
		return this.subjects().find(s => s.id === subjectId)?.name ?? '';
	}
}

