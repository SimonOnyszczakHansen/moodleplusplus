import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AddQuizStudentRequest, CreateQuizRequest, SubmitQuizRequest } from '../models/requests';
import { Quiz, QuizAnswerResponse, QuizQuestionResponse, QuizReviewResponse, QuizStudentResponse, StudentQuizResponse } from '../models/responses';
import { User } from '../../../core/models/user.interface';

@Injectable({ providedIn: 'root' })
export class QuizService {
  constructor(private http: HttpClient) {}

  getQuizzesByUser(userId: string): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${environment.apiHost}/quiz/user/${userId}`);
  }

  getQuizzesByStudent(): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${environment.apiHost}/quiz/students/me/quizzes`);
  }

  getMyQuizStatus(quizId: string): Observable<QuizStudentResponse> {
    return this.http.get<QuizStudentResponse>(`${environment.apiHost}/quiz/${quizId}/student-status`);
  }

  getQuizById(quizId: string): Observable<Quiz> {
    return this.http.get<Quiz>(`${environment.apiHost}/quiz/${quizId}`);
  }

  getQuestionsByQuizId(quizId: string): Observable<QuizQuestionResponse[]> {
    return this.http.get<QuizQuestionResponse[]>(`${environment.apiHost}/quiz/${quizId}/questions`);
  }

  getStudentAnswers(quizId: string, studentId: string): Observable<QuizAnswerResponse[]> {
    return this.http.get<QuizAnswerResponse[]>(`${environment.apiHost}/quiz/${quizId}/students/${studentId}/answers`);
  }

  getQuizReview(quizId: string, studentId: string): Observable<QuizReviewResponse> {
    return this.http.get<QuizReviewResponse>(`${environment.apiHost}/quiz/${quizId}/students/${studentId}/review`);
  }

  getStudentQuiz(quizId: string, studentId: string): Observable<StudentQuizResponse> {
    return this.http.get<StudentQuizResponse>(`${environment.apiHost}/quiz/${quizId}/students/${studentId}`);
  }

  submitStudentQuiz(quizId: string, studentId: string, request: SubmitQuizRequest): Observable<void> {
    return this.http.post<void>(`${environment.apiHost}/quiz/${quizId}/students/${studentId}/submit`, request);
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