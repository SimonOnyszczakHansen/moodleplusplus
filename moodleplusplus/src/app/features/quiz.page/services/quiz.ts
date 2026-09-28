import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateQuizRequest } from '../models/requests';
import { Quiz } from '../models/responses';

@Injectable({ providedIn: 'root' })
export class QuizService {
  constructor(private http: HttpClient) {}

  getQuizzesByUser(userId: string): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${environment.apiHost}/quiz/user/${userId}`);
  }

  createQuiz(request: CreateQuizRequest): Observable<void> {
    return this.http.post<void>(`${environment.apiHost}/quiz`, request);
  }
}