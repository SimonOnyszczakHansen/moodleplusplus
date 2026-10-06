import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

// Models
import { User } from '../../models/user.interface';
import {
  ICreateGoalRequest,
  ICreateSubjectRequest,
  IEditGoalRequest,
  IEditSubjectRequest,
  ISubject,
  ISubjectGoal,
} from '../../models/subjects.model';
import { ITask } from '../../models/tasks.model';
import { AuthService } from '../../../core/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class SubjectsService {
  private refreshSubject = new Subject<void>();
  readonly refresh$ = this.refreshSubject.asObservable();
  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  // Subject

  getSubjectsData(): Observable<ISubject[]> {
    return this.http.get<ISubject[]>(`${environment.apiHost}/subject/getAllMySubjectsByTeacherId`);
  }

  getMySubjects(): Observable<ISubject[]> {
    const endpoint = this.auth.isTeacher
      ? '/subject/getAllMySubjectsByTeacherId'
      : '/subject/getAllMySubjects';
    return this.http.get<ISubject[]>(`${environment.apiHost}${endpoint}`);
  }

  getSubjectById(subjectId: string): Observable<ISubject> {
    return this.http.get<ISubject>(`${environment.apiHost}/subject/${subjectId}`);
  }

  getSubjectsByUserId(userId: string): Observable<ISubject> {
    return this.http.get<ISubject>(`${environment.apiHost}/subject/user/${userId}`);
  }

  createSubject(request: ICreateSubjectRequest): Observable<void> {
    return this.http
      .post<void>(`${environment.apiHost}/subject`, request)
      .pipe(tap(() => this.refreshSubject.next()));
  }

  putSubjectById(subjectId: string, request: IEditSubjectRequest): Observable<void> {
    return this.http
      .put<void>(`${environment.apiHost}/subject/${subjectId}`, request)
      .pipe(tap(() => this.refreshSubject.next()));
  }

  deleteSubjectById(subjectId: string): Observable<void> {
    return this.http
      .delete<void>(`${environment.apiHost}/subject/${subjectId}`)
      .pipe(tap(() => this.refreshSubject.next()));
  }

  // Subject Tasks

  getTasksBySubjectId(subjectId: string): Observable<ITask[]> {
    return this.http.get<ITask[]>(`${environment.apiHost}/tasks/subjectid/${subjectId}`);
  }

  // Subject Students

  getStudentsBySubjectId(subjectId: string): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiHost}/user/subjectid/${subjectId}`);
  }

  // Subject Goals

  getGoalById(goalId: string): Observable<ISubjectGoal> {
    return this.http.get<ISubjectGoal>(`${environment.apiHost}/goal/${goalId}`);
  }

  getGoalsBySubjectId(subjectId: string): Observable<ISubjectGoal[]> {
    return this.http.get<ISubjectGoal[]>(`${environment.apiHost}/goal/subjectid/${subjectId}`);
  }

  createGoals(requests: ICreateGoalRequest[]): Observable<void> {
    return this.http
      .post<void>(`${environment.apiHost}/goal`, requests)
      .pipe(tap(() => this.refreshSubject.next()));
  }

  createGoal(request: ICreateGoalRequest): Observable<void> {
    return this.createGoals([request]);
  }

  editGoalById(goalId: string, request: IEditGoalRequest): Observable<void> {
    return this.http
      .patch<void>(`${environment.apiHost}/goal/${goalId}`, request)
      .pipe(tap(() => this.refreshSubject.next()));
  }

  deleteGoalById(goalId: string): Observable<void> {
    return this.http
      .delete<void>(`${environment.apiHost}/goal/${goalId}`)
      .pipe(tap(() => this.refreshSubject.next()));
  }
}
