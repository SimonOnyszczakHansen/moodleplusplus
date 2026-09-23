import { IObjective } from '../../../core/models/educationgoal.model';

// Matches SubmissionDto.Status Danish strings from SubmissionService.ToDto - confirm casing against a real response before relying on this.
export type TaskStatus = 'Ikke afleveret' | 'Afleveret' | 'Godkendt' | 'Ikke godkendt';

// ReviewSubmissionRequest.Status uses a separate vocabulary ("Godkendt"/"Approved", "Ikke godkendt"/"Rejected") - confirm exact values with backend.
export type ReviewStatus = 'Godkendt' | 'Ikke godkendt';

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

export interface ISubmissionFile {
    id: string;
    fileName: string;
    uploadedAt: string;
}

export interface ISubmission {
    comment: string;
    submittedAt: string;
    file?: ISubmissionFile;
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