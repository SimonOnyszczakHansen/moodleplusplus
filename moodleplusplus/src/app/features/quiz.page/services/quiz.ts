import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AddQuizStudentRequest, CreateQuizRequest } from '../models/requests';
import { Quiz, QuizStudentResponse } from '../models/responses';
import { User } from '../../../core/models/user.interface';

@Injectable({ providedIn: 'root' })
export class QuizService {
  constructor(private http: HttpClient) {}

  getQuizzesByUser(userId: string): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${environment.apiHost}/quiz/user/${userId}`);
  }

  createQuiz(request: CreateQuizRequest): Observable<void> {
    return this.http.post<void>(`${environment.apiHost}/quiz`, request);
  }

  getQuizStudents(quizId: string): Observable<QuizStudentResponse[]> {
    return this.http.get<QuizStudentResponse[]>(`${environment.apiHost}/quiz/${quizId}/students`);
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiHost}/user`);
  }

  addStudent(quizId: string, request: AddQuizStudentRequest): Observable<void> {
    return this.http.post<void>(`${environment.apiHost}/quiz/${quizId}/students`, request);
  }

  removeStudent(quizId: string, studentId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiHost}/quiz/${quizId}/students/${studentId}`);
  }
}