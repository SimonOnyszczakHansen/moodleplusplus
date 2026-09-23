import { IEducationGoal } from '../../../core/models/educationgoal.model';

export type TaskStatus = 'ikke afleveret' | 'afleveret' | 'godkendt' | 'afvist';

export interface ITask {
    id: string;
    subjectId: string;
    title: string;
    description: string;
    deadline: string;
}

export interface ICreateTaskRequest {
    subjectId: string;
    title: string;
    description?: string;
    deadline?: string;
}

export interface ITaskAssignmentSummary {
    assignmentId: string;
    taskId: string;
    title: string;
    deadline: string;
    status: TaskStatus;
	groupId?: string;
    groupName?: string;
}

export interface ISubmission {
    comment: string;
    fileName?: string;
    fileUrl?: string;
    submittedAt: string;
}

export interface IFeedbackEntry {
    text: string;
    createdAt: string;
    teacherName?: string;
}

export interface ITaskAssignmentDetail extends ITaskAssignmentSummary {
    description: string;
	goals: IEducationGoal[];
    submission: ISubmission | null;
    feedback: IFeedbackEntry[];
}