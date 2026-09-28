import { CreateQuizQuestionRequest } from './create-quiz-question-request';

export interface CreateQuizRequest {
	subjectId: string;
	title: string;
	description: string;
	passingPercentage: number;
	questions: CreateQuizQuestionRequest[];
}