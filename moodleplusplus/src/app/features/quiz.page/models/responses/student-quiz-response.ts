import { StudentQuizQuestionResponse } from './student-quiz-question-response';

export interface StudentQuizResponse {
	id: string;
	title: string;
	description: string;
	questions: StudentQuizQuestionResponse[];
}