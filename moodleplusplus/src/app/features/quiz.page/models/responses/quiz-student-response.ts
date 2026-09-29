export interface QuizStudentResponse {
	id: string;
	quizId: string;
	studentId: string;
	assignedAt: string;
	scorePercentage: number | null;
	passed: boolean | null;
	completedAt: string | null;
	status: string;
}