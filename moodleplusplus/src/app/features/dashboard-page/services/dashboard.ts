import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { DashboardResponse } from '../models/dashboard.model';
import { environment } from '../../../../environments/environment';
import { IApiTaskAssignment } from '../../../core/models/tasks.model';
import { IDashboardTaskPreview } from '../models/task.model';
import { AuthService } from '../../../core/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  getDashboardData(): Observable<DashboardResponse> {
    const endpoint = this.auth.isTeacher ? '/dashboard/teacher/me' : '/dashboard/me';
    return this.http.get<DashboardResponse>(`${environment.apiHost}${endpoint}`, {
      withCredentials: true,
    });
  }

  // Use all assignments for progress and deadline ordering when the dashboard response is paginated.
  getAllTasks(): Observable<IDashboardTaskPreview[]> {
    const statuses = ['NotSubmitted', 'AwaitingReview', 'Approved', 'Rejected'];
    return this.http
      .get<IApiTaskAssignment[]>(`${environment.apiHost}/task-assignments/me`, {
        withCredentials: true,
      })
      .pipe(
        map((assignments) =>
          assignments.map((assignment) => ({
            assignmentId: assignment.assignmentId,
            taskId: assignment.task.id,
            subjectId: assignment.task.subjectId,
            title: assignment.task.title,
            deadline: assignment.deadline,
            status: statuses[assignment.status] ?? 'Unknown',
          })),
        ),
      );
  }
}
