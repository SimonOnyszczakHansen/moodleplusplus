import { QuizAnswerOptionResponse } from './quiz-answer-option-response';

export interface QuizQuestionResponse {
	id: string;
	quizId: string;
	questionText: string;
	answerOptions: QuizAnswerOptionResponse[];
}