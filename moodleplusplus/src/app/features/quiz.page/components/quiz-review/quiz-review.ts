import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { QuizService } from '../../services/quiz';
import { QuizReviewQuestionResponse } from '../../models/responses';

@Component({
	selector: 'app-quiz-review',
	imports: [RouterLink],
	templateUrl: './quiz-review.html',
	styleUrl: './quiz-review.css',
})
export class QuizReview implements OnInit {
	private readonly route = inject(ActivatedRoute);
	private readonly router = inject(Router);
	private readonly authService = inject(AuthService);
	private readonly quizService = inject(QuizService);

	readonly questions = signal<QuizReviewQuestionResponse[]>([]);
	readonly quizTitle = signal('Quizresultat');
	readonly errorMessage = signal<string | null>(null);
	readonly isLoading = signal(true);
	readonly scorePercentage = signal(0);
	readonly correctCount = signal(0);
	readonly studentId = signal('');

	ngOnInit(): void {
		const role = String(this.authService.currentUser?.role).toLowerCase();
		const isStudent = role === 'student' || role === '3';
		const isTeacher = role === 'teacher' || role === '2';
		const quizId = this.route.snapshot.paramMap.get('quizId') ?? '';
		const requestedStudentId = this.route.snapshot.paramMap.get('studentId') ?? '';
		const currentUserId = this.authService.currentUser?.id;

		if (isStudent && String(currentUserId) !== requestedStudentId) {
			this.router.navigate(['/quizzes']);
			return;
		}
		if (!quizId || !requestedStudentId || (!isStudent && !isTeacher)) {
			this.errorMessage.set('Quizresultatet kunne ikke findes.');
			this.isLoading.set(false);
			return;
		}

		this.studentId.set(requestedStudentId);
		this.quizService.getQuizReview(quizId, requestedStudentId).subscribe({
			next: (review) => {
				this.quizTitle.set(review.quizTitle);
				this.questions.set(review.questions);
				this.scorePercentage.set(review.scorePercentage);
				this.correctCount.set(review.questions.filter((question) => question.isCorrect).length);
				this.isLoading.set(false);
			},
			error: () => this.failLoading(),
		});
	}

	private failLoading(): void {
		this.errorMessage.set('Svarene kunne ikke hentes.');
		this.isLoading.set(false);
	}
}