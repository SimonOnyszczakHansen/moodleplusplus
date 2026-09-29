import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ISubject, ISubjectGoal } from '../models/subjects.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SubjectsService {
  private readonly fallbackSubjects: ISubject[] = [
    {
      id: 'subject-1',
      name: 'Programmering',
      createdAt: '2026-01-01T12:00:00Z',
      createdBy: 'teacher-1',
    },
    {
      id: 'subject-2',
      name: 'Databaser',
      createdAt: '2026-01-01T12:00:00Z',
      createdBy: 'teacher-1',
    },
    {
      id: 'subject-3',
      name: 'Matematik',
      createdAt: '2026-01-01T12:00:00Z',
      createdBy: 'teacher-1',
    },
  ];

  private readonly fallbackGoals: Record<string, ISubjectGoal[]> = {
    'subject-1': [
      {
        id: 'goal-1',
        subjectId: 'subject-1',
        content: 'Kan forklare REST API-design og HTTP-statuskoder.',
      },
      {
        id: 'goal-2',
        subjectId: 'subject-1',
        content: 'Kan implementere frontend-komponenter med Angular 21.',
      },
    ],
    'subject-2': [
      { id: 'goal-3', subjectId: 'subject-2', content: 'Kan lave relationelle forespørgsler.' },
    ],
    'subject-3': [{ id: 'goal-4', subjectId: 'subject-3', content: 'Kan løse lineære ligninger.' }],
  };

  constructor(private http: HttpClient) {}

  getSubjectsData(): Observable<ISubject[]> {
    return this.http
      .get<ISubject[]>(`${environment.apiHost}/subject`)
      .pipe(catchError(() => of(this.fallbackSubjects)));
  }

  getSubjectById(subjectId: string): Observable<ISubject> {
    return this.http.get<ISubject>(`${environment.apiHost}/subject/${subjectId}`).pipe(
      catchError(() =>
        of(
          this.fallbackSubjects.find((subject) => String(subject.id) === String(subjectId)) ?? {
            id: subjectId,
            name: 'Programmering',
            createdAt: '2026-01-01T12:00:00Z',
            createdBy: 'teacher-1',
          },
        ),
      ),
    );
  }

  getGoalsBySubjectId(subjectId: string): Observable<ISubjectGoal[]> {
    return this.http
      .get<ISubjectGoal[]>(`${environment.apiHost}/Goal/subjectid/${subjectId}`)
      .pipe(
        catchError(() =>
          of(this.fallbackGoals[subjectId] ?? this.fallbackGoals['subject-1'] ?? []),
        ),
      );
  }
}
