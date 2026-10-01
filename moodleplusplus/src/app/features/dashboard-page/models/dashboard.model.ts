import { IDashboardTask, ITeacherDashboardAssignment } from './task.model';
import { IDashboardQuiz } from './quiz.model';
import { ISubject } from '../../../core/models/subjects.model';
import { ITask } from '../../../core/models/tasks.model';

export interface IPagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface IDashboardSummary {
  tasks: {
    assigned: number;
    approved: number;
    awaitingReview: number;
    rejected: number;
    notSubmitted: number;
    completionPercentage: number;
  };
  quizzes: {
    assigned: number;
    completed: number;
    passed: number;
    failed: number;
    completionPercentage: number;
  };
}

export interface IDashboard {
  studentId: string;
  studentName: string;
  summary?: IDashboardSummary;
  tasks: IPagedResult<IDashboardTask>;
  quizzes?: IPagedResult<IDashboardQuiz>;
  recentFeedback?: IPagedResult<unknown>;
}

export interface ITeacherDashboard {
  teacherId: string;
  teacherName: string;
  email: string;
  subjects: IPagedResult<ISubject>;
  tasks: IPagedResult<ITask>;
  assignments: IPagedResult<ITeacherDashboardAssignment>;
}

export type DashboardResponse = IDashboard | ITeacherDashboard;
