import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { StudentQuizResponse } from '../../models/responses';
import { QuizService } from '../../services/quiz';

@Component({
	selector: 'app-answer-quiz',
	imports: [RouterLink],
	templateUrl: './answer-quiz.html',
	styleUrl: './answer-quiz.css',
})
export class AnswerQuiz implements OnInit {
	private readonly route = inject(ActivatedRoute);
	private readonly router = inject(Router);
	private readonly authService = inject(AuthService);
	private readonly quizService = inject(QuizService);

	readonly quiz = signal<StudentQuizResponse | null>(null);
	readonly selectedAnswers = signal<Record<string, string>>({});
	readonly errorMessage = signal<string | null>(null);
	readonly isLoading = signal(true);
	readonly isSubmitting = signal(false);

	private quizId = '';
	private studentId = '';

	ngOnInit(): void {
		const role = String(this.authService.currentUser?.role).toLowerCase();
		if (role !== 'student' && role !== '3') {
			this.router.navigate(['/quizzes']);
			return;
		}

		this.quizId = this.route.snapshot.paramMap.get('quizId') ?? '';
		const currentUserId = this.authService.currentUser?.id;
		if (!this.quizId || currentUserId === null || currentUserId === undefined) {
			this.errorMessage.set('Quiz eller bruger kunne ikke findes.');
			this.isLoading.set(false);
			return;
		}

		this.studentId = String(currentUserId);
		this.quizService.getStudentQuiz(this.quizId, this.studentId).subscribe({
			next: (quiz) => {
				this.quiz.set(quiz);
				this.isLoading.set(false);
			},
			error: () => {
				this.errorMessage.set('Quizzen kunne ikke hentes.');
				this.isLoading.set(false);
			},
		});
	}

	selectAnswer(questionId: string, answerOptionId: string): void {
		this.selectedAnswers.update((answers) => ({ ...answers, [questionId]: answerOptionId }));
	}

	get canSubmit(): boolean {
		const questions = this.quiz()?.questions ?? [];
		const answers = this.selectedAnswers();
		return questions.length > 0 && questions.every((question) => Boolean(answers[question.id]));
	}

	submitQuiz(): void {
		const quiz = this.quiz();
		if (!quiz || !this.canSubmit || this.isSubmitting()) {
			return;
		}

		this.errorMessage.set(null);
		this.isSubmitting.set(true);
		const answers = quiz.questions.map((question) => ({
			quizQuestionId: question.id,
			selectedAnswerOptionId: this.selectedAnswers()[question.id],
		}));

		this.quizService.submitStudentQuiz(this.quizId, this.studentId, { answers }).subscribe({
			next: () => this.router.navigate(['/quizzes', this.quizId, 'review', this.studentId]),
			error: () => {
				this.isSubmitting.set(false);
				this.errorMessage.set('Svarene kunne ikke afleveres. Prøv igen.');
			},
		});
	}
}