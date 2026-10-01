export type ProgressionTaskStatus = 'NotSubmitted' | 'Submitted' | 'Approved' | 'Rejected';
export type ProgressionQuizStatus = 'Available' | 'Passed' | 'Failed';

export interface IProgressionSubject {
    id: string;
    name: string;
    createdAt: string;
    createdBy: string;
}

export interface IProgressionTaskCounts {
    assigned: number;
    approved: number;
    awaitingReview: number;
    rejected: number;
    notSubmitted: number;
    completionPercentage: number;
}

export interface IProgressionQuizCounts {
    assigned: number;
    completed: number;
    passed: number;
    failed: number;
    completionPercentage: number;
}

export interface IProgressionSummary {
    tasks: IProgressionTaskCounts;
    quizzes: IProgressionQuizCounts;
}

export interface IProgressionTask {
    assignmentId: string;
    taskId: string;
    title: string;
    subjectId: string;
    recipientType: 'student' | 'group';
    groupId: string | null;
    status: ProgressionTaskStatus;
    assignedAt: string;
    deadline: string;
    submittedAt: string | null;
    feedbackCount: number;
}

export interface IProgressionQuiz {
    quizId: string;
    title: string;
    subjectId: string;
    assignedAt: string;
    completedAt: string | null;
    scorePercentage: number | null;
    passed: boolean | null;
    status: ProgressionQuizStatus;
}

export interface IStudentSubjectProgress {
    studentId: string;
    studentName: string;
    subject: IProgressionSubject;
    completionPercentage: number;
    summary: IProgressionSummary;
    tasks: IProgressionTask[];
    quizzes: IProgressionQuiz[];
}