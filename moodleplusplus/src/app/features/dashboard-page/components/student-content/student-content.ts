import { Component } from '@angular/core';
import { Card } from '../../../../shared/card/card';
import { CommonModule } from '@angular/common';
import { ProgressBar } from '../../../../shared/progress-bar/progress-bar';
import { Button } from '../../../../shared/button/button';
import { OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard';
import { Router } from '@angular/router';
import { ISubject } from '../../models/subject.model';
import { ITask } from '../../models/task.model';
import { IQuiz } from '../../models/quiz.model';

@Component({
	selector: 'app-student-content',
	imports: [CommonModule, Card, ProgressBar, Button],
	templateUrl: './student-content.html',
	styleUrl: './student-content.css',
})
export class StudentContent implements OnInit {
	subjects: ISubject[] = [];
	tasks: ITask[] = [];
	quizzes: IQuiz[] = [];

	constructor(private dashboard: DashboardService, private router: Router) { }

	ngOnInit() {
		this.dashboard.getDashboardData().subscribe(data => {
			this.subjects = data.subjects;
			this.tasks = data.tasks;
			this.quizzes = data.quizzes;
		});
	}

	get pendingTasks(): ITask[] {
		return this.tasks
			.filter(t => t.status === 'Ikke afleveret' || t.status === 'Ikke godkendt')
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

	getSubjectProgress(subjectId: number): number {
		const subjectQuizzes = this.quizzes.filter(q => q.subjectId === subjectId);
		const subjectTasks = this.tasks.filter(t => t.subjectId === subjectId);

		const quizRatio = subjectQuizzes.length
			? subjectQuizzes.filter(q => q.passed).length / subjectQuizzes.length
			: 0;

		const taskRatio = subjectTasks.length
			? subjectTasks.filter(t => t.status === 'Godkendt').length / subjectTasks.length
			: 0;

		return Math.round(((quizRatio + taskRatio) / 2) * 100);
	}
}
