export interface IDashboardTask {
	assignmentId: string;
	taskId: string;
	title: string;
	subjectId: string;
	recipientType: string;
	groupId: string | null;
	status: string;
	assignedAt: string;
	deadline: string | null;
	submittedAt: string | null;
	feedbackCount: number;
}