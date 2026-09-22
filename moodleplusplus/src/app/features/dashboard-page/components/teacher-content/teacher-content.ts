import { Component, OnInit } from '@angular/core';
import { Card } from '../../../../shared/card/card';
import { CommonModule } from '@angular/common';
import { Button } from '../../../../shared/button/button';
import { DashboardService } from '../../services/dashboard';
import { Router } from '@angular/router';
import { ISubject } from '../../models/subject.model';
import { ITask } from '../../models/task.model';

@Component({
	selector: 'app-teacher-content',
	imports: [CommonModule, Card, Button],
	templateUrl: './teacher-content.html',
	styleUrl: './teacher-content.css',
})
export class TeacherContent implements OnInit {
	subjects: ISubject[] = [];
	tasks: ITask[] = [];

	constructor(private dashboard: DashboardService, private router: Router) { }

	ngOnInit() {
		this.dashboard.getDashboardData().subscribe(data => {
			this.subjects = data.subjects;
			this.tasks = data.tasks;
		});
	}

	get upcomingTasks(): ITask[] {
		return this.tasks
			.filter(t => new Date(t.deadline) >= new Date())
			.slice(0, 8);
	}

	viewSubject(subjectid: number) {
		this.router.navigate(['/subject', subjectid]);
	}

	viewAllSubjects() {
		this.router.navigate(['/subjects']);
	}

	viewAllTasks() {
		this.router.navigate(['/tasks']);
	}

	getSubjectName(subjectId: number): string {
		return this.subjects.find(s => s.id === subjectId)?.name ?? '';
	}
}
