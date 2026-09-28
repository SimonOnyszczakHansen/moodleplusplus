import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { QuizStudents } from './components/quiz-students/quiz-students';
import { Quiz } from './models/responses';
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
	errorMessage = signal<string | null>(null);
	private readonly userRole = String(this.authService.currentUser?.role).toLowerCase();
	readonly isTeacher = this.userRole === 'teacher' || this.userRole === '2';

	ngOnInit(): void {
		this.loadQuizzes();
	}

	loadQuizzes(): void {
		this.errorMessage.set(null);
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
			},
			error: () => {
				this.errorMessage.set('Quizzerne kunne ikke hentes. Prøv igen.');
			},
		});
	}
}
