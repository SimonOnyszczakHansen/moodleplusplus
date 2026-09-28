import { StudentQuizAnswerOptionResponse } from './student-quiz-answer-option-response';

export interface StudentQuizQuestionResponse {
	id: string;
	questionText: string;
	answerOptions: StudentQuizAnswerOptionResponse[];
	selectedAnswerOptionId: string | null;
}