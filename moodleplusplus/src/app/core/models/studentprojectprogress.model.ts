export interface IProgressionObjective {
	objectiveId: string;
    content: string;
    achieved: boolean;
}

export interface IProgressionCounts {
    assigned: number;
    completed: number;
    completionPercentage: number;
}

export interface IStudentSubjectProgress {
    studentId: string;
    subjectId: string;
    subjectName: string;
    overallCompletionPercentage: number;
    tasks: IProgressionCounts;
    quizzes: IProgressionCounts;
    objectives: IProgressionObjective[];
}