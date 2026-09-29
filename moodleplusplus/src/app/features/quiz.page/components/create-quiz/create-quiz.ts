import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ISubject } from '../../../task-page/models/subject.model';
import { Task as TaskService } from '../../../task-page/services/task';
import { CreateQuizRequest } from '../../models/requests';
import { QuizService } from '../../services/quiz';

interface QuizQuestionDraft {
	questionText: string;
	answerOptions: { answerText: string }[];
	correctAnswerIndex: number;
}

@Component({
	selector: 'app-create-quiz',
	imports: [FormsModule, RouterLink],
	templateUrl: './create-quiz.html',
	styleUrl: './create-quiz.css',
})
export class CreateQuiz implements OnInit {
	private readonly quizService = inject(QuizService);
	private readonly taskService = inject(TaskService);
	private readonly router = inject(Router);

	subjects = signal<ISubject[]>([]);
	isSaving = signal(false);
	createErrorMessage = signal<string | null>(null);
	quizTitle = '';
	quizDescription = '';
	passingPercentage = 70;
	selectedSubjectId = '';
	questions: QuizQuestionDraft[] = [this.newQuestion()];

	ngOnInit(): void {
		this.taskService.getSubjects().subscribe({
			next: (subjects) => this.subjects.set(subjects),
		});
	}

	addQuestion(): void {
		this.questions = [...this.questions, this.newQuestion()];
	}

	removeQuestion(questionIndex: number): void {
		if (this.questions.length > 1) {
			this.questions = this.questions.filter((_, index) => index !== questionIndex);
		}
	}

	createQuiz(): void {
		this.createErrorMessage.set(null);
		const rawPassingPercentage = String(this.passingPercentage ?? '').trim();
		const passingPercentage = Number(rawPassingPercentage);
		const hasEmptyFields =
			!this.selectedSubjectId ||
			!this.quizTitle.trim() ||
			!this.quizDescription.trim() ||
			this.questions.length === 0 ||
			this.questions.some((question) =>
				!question.questionText.trim() ||
				question.answerOptions.length !== 4 ||
				question.answerOptions.some((option) => !option.answerText.trim()),
			);

		if (
			this.isSaving() ||
			hasEmptyFields ||
			!rawPassingPercentage ||
			!Number.isFinite(passingPercentage) ||
			!Number.isInteger(passingPercentage) ||
			passingPercentage < 0 ||
			passingPercentage > 100
		) {
			this.createErrorMessage.set('Udfyld alle felter. Beståelsesprocenten skal være et helt tal mellem 0 og 100.');
			return;
		}

		const request: CreateQuizRequest = {
			subjectId: this.selectedSubjectId,
			title: this.quizTitle.trim(),
			description: this.quizDescription.trim(),
			passingPercentage,
			questions: this.questions.map((question) => ({
				questionText: question.questionText.trim(),
				answerOptions: question.answerOptions.map((option, answerIndex) => ({
					answerText: option.answerText.trim(),
					isCorrect: answerIndex === question.correctAnswerIndex,
				})),
			})),
		};

		this.isSaving.set(true);
		this.quizService.createQuiz(request).subscribe({
			next: () => {
				this.isSaving.set(false);
				this.router.navigate(['/quizzes']);
			},
			error: () => {
				this.isSaving.set(false);
				this.createErrorMessage.set('Quizzen kunne ikke oprettes.');
			},
		});
	}

	private newQuestion(): QuizQuestionDraft {
		return {
			questionText: '',
			answerOptions: [{ answerText: '' }, { answerText: '' }, { answerText: '' }, { answerText: '' }],
			correctAnswerIndex: 0,
		};
	}
}