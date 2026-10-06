import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ISubject } from '../../models/subjects.model';
import { IAssignee } from '../../models/assignee.model';
import { IApiGroup } from '../../models/group.model';
import * as tasksUtils from './tasks.utils';
import * as tasksModels from '../../models/tasks.model';

@Injectable({ providedIn: 'root' })
export class TasksService {
  private readonly base = `${environment.apiHost}`;

  constructor(private http: HttpClient) {}

  // Tasks

  getTasks(): Observable<tasksModels.ITask[]> {
    return this.http.get<tasksModels.ITask[]>(`${this.base}/tasks`);
  }

  getTask(taskId: string): Observable<tasksModels.ITeacherTaskDetail> {
    return this.http
      .get<tasksModels.IApiTeacherTaskDetail>(`${this.base}/tasks/${taskId}`)
      .pipe(map(tasksUtils.mapApiTeacherTaskDetail));
  }

  getTasksBySubjectId(subjectId: string): Observable<tasksModels.ITask[]> {
    return this.http.get<tasksModels.ITask[]>(`${this.base}/tasks/subjectid/${subjectId}`);
  }

  getMyTasks(): Observable<tasksModels.ITask[]> {
    return this.http.get<tasksModels.ITask[]>(`${this.base}/tasks/students/me/tasks`);
  }

  createTask(request: tasksModels.ICreateTaskRequest): Observable<tasksModels.ITask> {
    return this.http.post<tasksModels.ITask>(`${this.base}/tasks`, request);
  }

  updateTask(
    taskId: string,
    request: tasksModels.ICreateTaskRequest,
  ): Observable<tasksModels.ITask> {
    return this.http.patch<tasksModels.ITask>(`${this.base}/tasks/${taskId}`, request);
  }

  assignTask(
    taskId: string,
    studentIds: string[],
    groupIds: string[],
  ): Observable<tasksModels.ITaskAssignmentSummary[]> {
    return this.http
      .post<
        tasksModels.IApiTaskAssignment[]
      >(`${this.base}/tasks/${taskId}/assignments`, { studentIds, groupIds })
      .pipe(map((assignments) => assignments.map(tasksUtils.mapApiAssignment)));
  }

  linkTaskGoals(taskId: string, goalIds: string[]): Observable<void> {
    return this.http.put<void>(`${this.base}/tasks/${taskId}/objectives`, {
      objectiveIds: goalIds,
    });
  }

  deleteTask(taskId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/tasks/${taskId}`);
  }

  // Other

  getGroups(): Observable<IAssignee[]> {
    return this.http
      .get<IApiGroup[]>(`${this.base}/groups`)
      .pipe(map((groups) => groups.map(tasksUtils.mapApiGroupToAssignee)));
  }

  getStudents(): Observable<IAssignee[]> {
    return this.http
      .get<tasksModels.IApiUser[]>(`${this.base}/user`)
      .pipe(
        map((users) =>
          users.filter((user) => user.role === 3).map(tasksUtils.mapApiUserToAssignee),
        ),
      );
  }

  // Assignments

  getMyAssignments(): Observable<tasksModels.ITaskAssignmentSummary[]> {
    return this.http
      .get<tasksModels.IApiTaskAssignment[]>(`${this.base}/task-assignments/me`)
      .pipe(map((assignments) => assignments.map(tasksUtils.mapApiAssignment)));
  }

  getMyAssignmentsBySubjectId(subjectId: string): Observable<tasksModels.ITaskAssignmentSummary[]> {
    return this.http
      .get<
        tasksModels.IApiTaskAssignment[]
      >(`${this.base}/task-assignments/me/subjectid/${subjectId}`)
      .pipe(map((assignments) => assignments.map(tasksUtils.mapApiAssignment)));
  }

  getAssignment(assignmentId: string): Observable<tasksModels.ITaskAssignmentDetail> {
    return this.http
      .get<tasksModels.IApiTaskAssignment>(`${this.base}/task-assignments/${assignmentId}`)
      .pipe(map(tasksUtils.mapApiAssignmentDetail));
  }

  removeAssignment(assignmentId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/task-assignments/${assignmentId}`);
  }

  submitAssignment(
    assignmentId: string,
    comment: string,
    file?: File,
  ): Observable<tasksModels.ISubmission> {
    const formData = new FormData();
    formData.append('comment', comment);
    if (file) {
      formData.append('file', file);
    }
    return this.http.post<tasksModels.ISubmission>(
      `${this.base}/task-assignments/${assignmentId}/submission`,
      formData,
    );
  }

  getSubmission(assignmentId: string): Observable<tasksModels.ISubmission> {
    return this.http.get<tasksModels.ISubmission>(
      `${this.base}/task-assignments/${assignmentId}/submission`,
    );
  }

  getSubmissionFileUrl(assignmentId: string): string {
    return `${this.base}/task-assignments/${assignmentId}/submission/file`;
  }

  downloadSubmissionFile(assignmentId: string): Observable<Blob> {
    return this.http.get(this.getSubmissionFileUrl(assignmentId), { responseType: 'blob' });
  }

  reviewSubmission(
    assignmentId: string,
    status: tasksModels.ReviewStatus,
  ): Observable<tasksModels.ISubmission> {
    return this.http.patch<tasksModels.ISubmission>(
      `${this.base}/task-assignments/${assignmentId}/submission/status`,
      { status },
    );
  }

  getFeedback(studentId: string, taskId: string): Observable<tasksModels.IFeedbackEntry[]> {
    return this.http.get<tasksModels.IFeedbackEntry[]>(
      `${this.base}/task-assignments/students/${studentId}/tasks/${taskId}/feedback`,
    );
  }

  addFeedback(
    studentId: string,
    taskId: string,
    text: string,
    assignmentId?: string,
  ): Observable<void> {
    return this.http.post<void>(
      `${this.base}/task-assignments/students/${studentId}/tasks/${taskId}/feedback`,
      {
        text,
        assignmentId,
      },
    );
  }
}
