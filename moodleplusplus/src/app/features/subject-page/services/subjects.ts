import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  ICreateSubjectRequest,
  IEditSubjectRequest,
  ISubject,
  ISubjectGoal,
} from '../models/subjects.model';
import { environment } from '../../../../environments/environment';
import { ITask } from '../../task-page/models/task.model';
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

  getGoalsBySubjectId(subjectId: string): Observable<ISubjectGoal[]> {
    return this.http.get<ISubjectGoal[]>(`${environment.apiHost}/goal/subjectid/${subjectId}`);
  }

  getTasksBySubjectId(subjectId: string): Observable<ITask[]> {
    return this.http.get<ITask[]>(`${environment.apiHost}/tasks/subjectid/${subjectId}`);
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

  createSubject(request: ICreateSubjectRequest): Observable<void> {
    return this.http
      .post<void>(`${environment.apiHost}/subject`, request)
      .pipe(tap(() => this.refreshSubject.next()));
  }
}
