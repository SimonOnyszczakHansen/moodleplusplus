import { CreateQuizAnswerOptionRequest } from './create-quiz-answer-option-request';

export interface CreateQuizQuestionRequest {
	questionText: string;
	answerOptions: CreateQuizAnswerOptionRequest[];
}