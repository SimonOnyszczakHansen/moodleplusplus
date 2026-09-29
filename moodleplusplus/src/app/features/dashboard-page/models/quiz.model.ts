// Backend has not returned a populated quizzes array yet - shape below is a best-effort guess, verify once real data exists.
export interface IDashboardQuiz {
	id: string;
	title: string;
	subjectId: string;
	passed: boolean;
}