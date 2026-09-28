export interface QuizResponse {
	id: string;
	subjectId: string;
	createdByUserId: string;
	title: string;
	description: string;
	passingPercentage: number;
	createdAt: string;
}

export type Quiz = QuizResponse;