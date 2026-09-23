import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ICreateTaskRequest, ITask, ITaskAssignmentDetail, ITaskAssignmentSummary, TaskStatus, } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class Task {
	private readonly base = `${environment.apiUrl}/api/v1`;

	constructor(private http: HttpClient) { }

	// Teacher: task administration
	getTasks(): Observable<ITask[]> {
		return this.http.get<ITask[]>(`${this.base}/tasks`);
	}

	getTask(taskId: string): Observable<ITask> {
		return this.http.get<ITask>(`${this.base}/tasks/${taskId}`);
	}

	createTask(request: ICreateTaskRequest): Observable<ITask> {
		return this.http.post<ITask>(`${this.base}/tasks`, request);
	}

	updateTask(taskId: string, request: ICreateTaskRequest): Observable<ITask> {
		return this.http.patch<ITask>(`${this.base}/tasks/${taskId}`, request);
	}

	assignTask(taskId: string, studentIds: string[], groupIds: string[]): Observable<void> {
		return this.http.post<void>(`${this.base}/tasks/${taskId}/assignments`, { studentIds, groupIds });
	}

	linkTaskGoals(taskId: string, goalIds: string[]): Observable<void> {
		return this.http.put<void>(`${this.base}/tasks/${taskId}/objectives`, { goalIds });
	}

	deleteTask(taskId: string): Observable<void> {
		return this.http.delete<void>(`${this.base}/tasks/${taskId}`);
	}

	// Student: assignments
	getMyAssignments(): Observable<ITaskAssignmentSummary[]> {
		return this.http.get<ITaskAssignmentSummary[]>(`${this.base}/task-assignments/me`);
	}

	getAssignment(assignmentId: string): Observable<ITaskAssignmentDetail> {
		return this.http.get<ITaskAssignmentDetail>(`${this.base}/task-assignments/${assignmentId}`);
	}

	submitAssignment(assignmentId: string, comment: string, file?: File): Observable<void> {
		const formData = new FormData();
		formData.append('comment', comment);
		if (file) {
			formData.append('file', file);
		}
		return this.http.post<void>(`${this.base}/task-assignments/${assignmentId}/submission`, formData);
	}

	reviewSubmission(assignmentId: string, status: Extract<TaskStatus, 'godkendt' | 'afvist'>): Observable<void> {
		return this.http.patch<void>(`${this.base}/task-assignments/${assignmentId}/submission/status`, { status });
	}

	addFeedback(studentId: string, taskId: string, text: string): Observable<void> {
		return this.http.post<void>(`${this.base}/students/${studentId}/tasks/${taskId}/feedback`, { text });
	}
}