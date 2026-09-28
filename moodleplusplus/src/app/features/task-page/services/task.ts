import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
	ICreateTaskRequest, ISubmission, ITask, ITaskAssignmentDetail, ITaskAssignmentSummary, ITaskAssignmentRow,
	IFeedbackEntry, ReviewStatus, ITeacherTaskDetail, IApiTaskAssignment, IApiAssignmentRow, IApiTeacherTaskDetail,
	mapAssignmentStatus,
} from '../models/task.model';
import { ISubject } from '../models/subject.model';
import { IAssignee } from '../models/assignee.model';
import { IApiGroup } from '../models/group.model';

// /user returns role as a raw numeric enum, same as /auth/login (3 = Student).
interface IApiUser {
	id: string;
	name: string;
	role: number;
}

function mapApiGroupToAssignee(api: IApiGroup): IAssignee {
	return { id: api.id, name: api.name, type: 'group' };
}

function mapApiUserToAssignee(api: IApiUser): IAssignee {
	return { id: String(api.id), name: api.name, type: 'student' };
}

function mapApiAssignment(api: IApiTaskAssignment): ITaskAssignmentSummary {
	return {
		assignmentId: api.assignmentId,
		taskId: api.task.id,
		title: api.task.title,
		deadline: api.deadline,
		status: mapAssignmentStatus(api.status),
		groupId: api.recipientType === 'group' ? api.recipientId : undefined,
		groupName: api.recipientType === 'group' ? api.recipientName : undefined,
	};
}

function mapApiAssignmentDetail(api: IApiTaskAssignment): ITaskAssignmentDetail {
	return {
		...mapApiAssignment(api),
		description: api.task.description,
		submission: null,
		feedback: [],
		objectives: [],
	};
}

function mapApiAssignmentRow(api: IApiAssignmentRow): ITaskAssignmentRow {
	return {
		assignmentId: api.assignmentId,
		studentId: api.recipientType === 'student' ? api.recipientId : undefined,
		studentName: api.recipientType === 'student' ? api.recipientName : undefined,
		groupId: api.recipientType === 'group' ? api.recipientId : undefined,
		groupName: api.recipientType === 'group' ? api.recipientName : undefined,
		status: mapAssignmentStatus(api.status),
		submission: null,
		feedback: [],
	};
}

function mapApiTeacherTaskDetail(api: IApiTeacherTaskDetail): ITeacherTaskDetail {
	return {
		...api.task,
		objectives: api.objectives,
		assignments: api.assignments.map(mapApiAssignmentRow),
	};
}

@Injectable({ providedIn: 'root' })
export class Task {
	private readonly base = `${environment.apiHost}`;

	constructor(private http: HttpClient) { }

	// Teacher: task administration
	getTasks(): Observable<ITask[]> {
		return this.http.get<ITask[]>(`${this.base}/tasks`);
	}

	getSubjects(): Observable<ISubject[]> {
		return this.http.get<ISubject[]>(`${this.base}/subject`);
	}

	getGroups(): Observable<IAssignee[]> {
		return this.http.get<IApiGroup[]>(`${this.base}/groups`).pipe(map((groups) => groups.map(mapApiGroupToAssignee)));
	}

	getStudents(): Observable<IAssignee[]> {
		return this.http
			.get<IApiUser[]>(`${this.base}/user`)
			.pipe(map((users) => users.filter((u) => u.role === 3).map(mapApiUserToAssignee)));
	}

	getTask(taskId: string): Observable<ITeacherTaskDetail> {
		return this.http.get<IApiTeacherTaskDetail>(`${this.base}/tasks/${taskId}`).pipe(map(mapApiTeacherTaskDetail));
	}

	createTask(request: ICreateTaskRequest): Observable<ITask> {
		return this.http.post<ITask>(`${this.base}/tasks`, request);
	}

	updateTask(taskId: string, request: ICreateTaskRequest): Observable<ITask> {
		return this.http.patch<ITask>(`${this.base}/tasks/${taskId}`, request);
	}

	assignTask(taskId: string, studentIds: string[], groupIds: string[]): Observable<ITaskAssignmentSummary[]> {
		return this.http
			.post<IApiTaskAssignment[]>(`${this.base}/tasks/${taskId}/assignments`, { studentIds, groupIds })
			.pipe(map((assignments) => assignments.map(mapApiAssignment)));
	}

	linkTaskGoals(taskId: string, goalIds: string[]): Observable<void> {
		return this.http.put<void>(`${this.base}/tasks/${taskId}/objectives`, { objectiveIds: goalIds });
	}

	deleteTask(taskId: string): Observable<void> {
		return this.http.delete<void>(`${this.base}/tasks/${taskId}`);
	}

	// Student: assignments
	getMyAssignments(): Observable<ITaskAssignmentSummary[]> {
		return this.http
			.get<IApiTaskAssignment[]>(`${this.base}/task-assignments/me`)
			.pipe(map((assignments) => assignments.map(mapApiAssignment)));
	}

	getAssignment(assignmentId: string): Observable<ITaskAssignmentDetail> {
		return this.http
			.get<IApiTaskAssignment>(`${this.base}/task-assignments/${assignmentId}`)
			.pipe(map(mapApiAssignmentDetail));
	}

	removeAssignment(assignmentId: string): Observable<void> {
		return this.http.delete<void>(`${this.base}/task-assignments/${assignmentId}`);
	}

	submitAssignment(assignmentId: string, comment: string, file?: File): Observable<ISubmission> {
		const formData = new FormData();
		formData.append('comment', comment);
		if (file) {
			formData.append('file', file);
		}
		return this.http.post<ISubmission>(`${this.base}/task-assignments/${assignmentId}/submission`, formData);
	}

	getSubmission(assignmentId: string): Observable<ISubmission> {
		return this.http.get<ISubmission>(`${this.base}/task-assignments/${assignmentId}/submission`);
	}

	getSubmissionFileUrl(assignmentId: string): string {
		return `${this.base}/task-assignments/${assignmentId}/submission/file`;
	}

	downloadSubmissionFile(assignmentId: string): Observable<Blob> {
		return this.http.get(this.getSubmissionFileUrl(assignmentId), { responseType: 'blob' });
	}

	reviewSubmission(assignmentId: string, status: ReviewStatus): Observable<ISubmission> {
		return this.http.patch<ISubmission>(`${this.base}/task-assignments/${assignmentId}/submission/status`, { status });
	}

	getFeedback(studentId: string, taskId: string): Observable<IFeedbackEntry[]> {
		return this.http.get<IFeedbackEntry[]>(`${this.base}/students/${studentId}/tasks/${taskId}/feedback`);
	}

	addFeedback(studentId: string, taskId: string, text: string, assignmentId?: string): Observable<void> {
		return this.http.post<void>(`${this.base}/students/${studentId}/tasks/${taskId}/feedback`, { text, assignmentId });
	}
}