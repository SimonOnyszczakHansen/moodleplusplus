import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { QuizStudents } from './components/quiz-students/quiz-students';
import { Quiz, QuizStudentResponse } from './models/responses';
import { QuizService } from './services/quiz';

@Component({
	selector: 'app-quiz-page',
	imports: [DatePipe, RouterLink, QuizStudents],
	templateUrl: './quiz-page.html',
	styleUrl: './quiz-page.css',
})
export class QuizPage implements OnInit {
	private readonly authService = inject(AuthService);
	private readonly quizService = inject(QuizService);

	quizzes = signal<Quiz[]>([]);
	quizStatuses = signal<Record<string, QuizStudentResponse | null>>({});
	quizStatusesLoaded = signal(false);
	errorMessage = signal<string | null>(null);
	private readonly userRole = String(this.authService.currentUser?.role).toLowerCase();
	readonly isTeacher = this.userRole === 'teacher' || this.userRole === '2';
	readonly isStudent = this.userRole === 'student' || this.userRole === '3';
	readonly currentUserId = this.authService.currentUser?.id;

	ngOnInit(): void {
		this.loadQuizzes();
	}

	loadQuizzes(): void {
		this.errorMessage.set(null);
		this.quizStatusesLoaded.set(false);
		let request;

		if (this.userRole === 'student' || this.userRole === '3') {
			request = this.quizService.getQuizzesByStudent();
		} else if (this.isTeacher) {
			const userId = this.authService.currentUser?.id;
			if (userId === null || userId === undefined) {
				this.errorMessage.set('Kunne ikke finde brugerens ID. Log ind igen, og prøv på ny.');
				return;
			}
			request = this.quizService.getQuizzesByUser(String(userId));
		} else {
			this.errorMessage.set('Din brugertype kan ikke se quizzer.');
			return;
		}

		request.subscribe({
			next: (quizzes) => {
				this.quizzes.set(quizzes);
					if (this.isStudent && quizzes.length > 0) {
					forkJoin(quizzes.map((quiz) =>
						this.quizService.getMyQuizStatus(quiz.id).pipe(catchError(() => of(null))),
					)).subscribe((statuses) => {
						this.quizStatuses.set(Object.fromEntries(
							quizzes.map((quiz, index) => [quiz.id, statuses[index]]),
						));
							this.quizStatusesLoaded.set(true);
					});
					} else {
						this.quizStatuses.set({});
						this.quizStatusesLoaded.set(true);
				}
			},
			error: () => {
				this.errorMessage.set('Quizzerne kunne ikke hentes. Prøv igen.');
			},
		});
	}
}
