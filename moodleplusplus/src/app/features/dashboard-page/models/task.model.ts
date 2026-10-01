export type IDashboardTaskPreview = Pick<
	IDashboardTask,
	'assignmentId' | 'taskId' | 'subjectId' | 'title' | 'status' | 'deadline'
> & { recipientName?: string };

export interface ITeacherDashboardAssignment extends IDashboardTaskPreview {
	recipientType: string;
	recipientId: string;
	recipientName: string;
	assignedAt: string;
}

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
