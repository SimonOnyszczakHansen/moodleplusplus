import { IObjective } from '../../../core/models/educationgoal.model';

export type TaskStatus = 'Ikke afleveret' | 'Afleveret' | 'Godkendt' | 'Ikke godkendt';

export type ReviewStatus = 'Godkendt' | 'Ikke godkendt';

export interface ITask {
    id: string;
    subjectId: string;
    title: string;
    description: string;
    deadline: string;
    createdAt?: string;
    createdByUserId?: string;
}

export interface ICreateTaskRequest {
    subjectId: string;
    title: string;
    description?: string;
    deadline?: string;
}

export type RecipientType = 'Student' | 'Group';

export interface IApiTaskAssignment {
    assignmentId: string;
    task: ITask;
    recipientType: RecipientType;
    recipientId: string;
    recipientName: string;
    deadline: string;
    status: number;
    assignedAt: string;
}

export interface IApiAssignmentRow {
    assignmentId: string;
    recipientType: RecipientType;
    recipientId: string;
    recipientName: string;
    deadline: string;
    status: number;
    assignedAt: string;
}

export interface IApiTeacherTaskDetail {
    task: ITask;
    objectives: IObjective[];
    assignments: IApiAssignmentRow[];
}

const ASSIGNMENT_STATUS_BY_ORDINAL: TaskStatus[] = ['Ikke afleveret', 'Afleveret', 'Godkendt', 'Ikke godkendt'];

export function mapAssignmentStatus(status: number): TaskStatus {
    return ASSIGNMENT_STATUS_BY_ORDINAL[status] ?? 'Ikke afleveret';
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

export interface ISubmissionFile {
    id: string;
    fileName: string;
    uploadedAt: string;
}

export interface ISubmission {
    id: string;
    assignmentId: string;
    comment: string;
    submittedAt: string;
    submittedByUserId: string;
    status: TaskStatus;
    file: ISubmissionFile | null;
}

export interface IFeedbackEntry {
    text: string;
    createdAt: string;
    teacherName?: string;
}

// submission, feedback and objectives are each separate endpoint calls, not bundled in the assignment response - fetch independently.
export interface ITaskAssignmentDetail extends ITaskAssignmentSummary {
    description: string;
    submission: ISubmission | null;
    feedback: IFeedbackEntry[];
    objectives: IObjective[];
}

// One roster row on the teacher's task detail view - a single student or group's assignment.
export interface ITaskAssignmentRow {
    assignmentId: string;
    studentId?: string;
    studentName?: string;
    groupId?: string;
    groupName?: string;
    status: TaskStatus;
    submission: ISubmission | null;
    feedback: IFeedbackEntry[];
}

// Matches TasksController GET /{taskId} - the task plus its objectives and every assignment.
export interface ITeacherTaskDetail extends ITask {
    objectives: IObjective[];
    assignments: ITaskAssignmentRow[];
}