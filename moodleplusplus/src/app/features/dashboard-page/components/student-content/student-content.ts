import { Component, signal } from '@angular/core';
import { Card } from '../../../../shared/card/card';
import { CommonModule } from '@angular/common';
import { ProgressBar } from '../../../../shared/progress-bar/progress-bar';
import { Button } from '../../../../shared/button/button';
import { OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard';
import { Task } from '../../../task-page/services/task';
import { Router } from '@angular/router';
import { ISubject } from '../../models/subject.model';
import { IDashboardTask } from '../../models/task.model';
import { IDashboardQuiz } from '../../models/quiz.model';

@Component({
	selector: 'app-student-content',
	imports: [CommonModule, Card, ProgressBar, Button],
	templateUrl: './student-content.html',
	styleUrl: './student-content.css',
})
export class StudentContent implements OnInit {
	subjects = signal<ISubject[]>([]);
	tasks = signal<IDashboardTask[]>([]);
	quizzes = signal<IDashboardQuiz[]>([]);

	constructor(
		private dashboard: DashboardService,
		private taskService: Task,
		private router: Router,
	) { }

	ngOnInit() {
		this.dashboard.getDashboardData().subscribe({
			next: data => {
				this.tasks.set(data.tasks.items);
				this.quizzes.set(data.quizzes.items);
			},
			error: err => console.error('Student dashboard fetch failed:', err),
		});
	}

	get pendingTasks(): IDashboardTask[] {
		return this.tasks()
			.filter(t => t.status === 'NotSubmitted' || t.status === 'Rejected')
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

	getSubjectProgress(subjectId: string): number {
		const subjectQuizzes = this.quizzes().filter(q => q.subjectId === subjectId);
		const subjectTasks = this.tasks().filter(t => t.subjectId === subjectId);

		const quizRatio = subjectQuizzes.length
			? subjectQuizzes.filter(q => q.passed).length / subjectQuizzes.length
			: 0;

		const taskRatio = subjectTasks.length
			? subjectTasks.filter(t => t.status === 'Approved').length / subjectTasks.length
			: 0;

		return Math.round(((quizRatio + taskRatio) / 2) * 100);
	}
}
