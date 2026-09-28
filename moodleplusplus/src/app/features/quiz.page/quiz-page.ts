import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Quiz } from './models/responses';
import { QuizService } from './services/quiz';

@Component({
	selector: 'app-quiz-page',
	imports: [DatePipe, RouterLink],
	templateUrl: './quiz-page.html',
	styleUrl: './quiz-page.css',
})
export class QuizPage implements OnInit {
	private readonly authService = inject(AuthService);
	private readonly quizService = inject(QuizService);

	quizzes = signal<Quiz[]>([]);
	errorMessage = signal<string | null>(null);
	readonly isTeacher = this.authService.currentUser?.role?.toLowerCase() === 'teacher';

	ngOnInit(): void {
		this.loadQuizzes();
	}

	loadQuizzes(): void {
		const userId = this.authService.currentUser?.id;
		if (userId === null || userId === undefined) {
			this.errorMessage.set('Kunne ikke finde brugerens ID. Log ind igen, og prøv på ny.');
			return;
		}

		this.errorMessage.set(null);
		this.quizService.getQuizzesByUser(String(userId)).subscribe({
			next: (quizzes) => {
				this.quizzes.set(quizzes);
			},
			error: () => {
				this.errorMessage.set('Quizzerne kunne ikke hentes. Prøv igen.');
			},
		});
	}
}
