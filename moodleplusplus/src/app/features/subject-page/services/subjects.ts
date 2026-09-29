import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ICreateSubjectRequest, ISubject, ISubjectGoal } from '../models/subjects.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SubjectsService {
  private refreshSubject = new Subject<void>();
  readonly refresh$ = this.refreshSubject.asObservable();
  constructor(private http: HttpClient) {}

  getSubjectsData(): Observable<ISubject[]> {
    return this.http.get<ISubject[]>(`${environment.apiHost}/subject`);
  }

  getSubjectById(subjectId: string): Observable<ISubject> {
    return this.http.get<ISubject>(`${environment.apiHost}/subject/${subjectId}`);
  }

  getGoalsBySubjectId(subjectId: string): Observable<ISubjectGoal[]> {
    return this.http.get<ISubjectGoal[]>(`${environment.apiHost}/goal/subjectid/${subjectId}`);
  }

  createSubject(request: ICreateSubjectRequest): Observable<void> {
    return this.http
      .post<void>(`${environment.apiHost}/subject`, request)
      .pipe(tap(() => this.refreshSubject.next()));
  }
}
