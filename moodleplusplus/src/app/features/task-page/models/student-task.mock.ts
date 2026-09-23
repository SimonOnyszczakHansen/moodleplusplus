import { ITaskAssignmentSummary } from './task.model';

export const MOCK_STUDENT_ASSIGNMENTS: ITaskAssignmentSummary[] = [
	{
		assignmentId: 'a1',
		taskId: 't1',
		title: 'Web API',
		deadline: '2026-10-01T23:59:00',
		status: 'ikke afleveret',
	},
	{
		assignmentId: 'a2',
		taskId: 't2',
		title: 'Database Design',
		deadline: '2026-09-20T23:59:00',
		status: 'afleveret',
	},
	{
		assignmentId: 'a3',
		taskId: 't3',
		title: 'Unit Testing',
		deadline: '2026-09-10T23:59:00',
		status: 'godkendt',
	},
	{
		assignmentId: 'a4',
		taskId: 't4',
		title: 'Design Patterns',
		deadline: '2026-09-05T23:59:00',
		status: 'afvist',
	},
	{
		assignmentId: 'a5',
		taskId: 't5',
		title: 'Gruppeprojekt: E-commerce',
		deadline: '2026-10-15T23:59:00',
		status: 'ikke afleveret',
		groupId: 'g1',
		groupName: 'Gruppe 3',
	},
];