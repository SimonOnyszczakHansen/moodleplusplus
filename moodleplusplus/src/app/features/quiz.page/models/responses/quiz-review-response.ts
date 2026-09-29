export interface QuizReviewQuestionResponse {
	questionId: string;
	questionText: string;
	selectedAnswerText: string | null;
	correctAnswerText: string;
	isCorrect: boolean;
}

export interface QuizReviewResponse {
	quizId: string;
	quizTitle: string;
	studentId: string;
	scorePercentage: number;
	completedAt: string | null;
	questions: QuizReviewQuestionResponse[];
}