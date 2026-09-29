import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { consentGuard } from './core/guards/consent-guard';
import { adminGuard } from './core/guards/admin-guard';
import { Dashboard } from './features/dashboard-page/dashboard';
import { ConsentPage } from './features/consent-page/consent-page';
import { Login } from './features/login-page/login';
import { Task } from './features/task-page/task';
import { TaskDetails } from './features/task-details/task-details';
import { Objectives } from './features/objectives/objectives';
import { QuizPage } from './features/quiz.page/quiz-page';
import { CreateQuiz } from './features/quiz.page/components/create-quiz/create-quiz';
import { AnswerQuiz } from './features/quiz.page/components/answer-quiz/answer-quiz';
import { QuizReview } from './features/quiz.page/components/quiz-review/quiz-review';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard, consentGuard] },
  { path: 'tasks', component: Task, canActivate: [authGuard, consentGuard] },
  { path: 'tasks/:id', component: TaskDetails, canActivate: [authGuard, consentGuard] },
  {
    path: 'tasks/:taskId/assignments/:assignmentId/history',
    loadComponent: () => import('./features/submission-history/submission-history').then((m) => m.SubmissionHistory),
    canActivate: [authGuard, consentGuard],
  },
  { path: 'objectives/:subjectId', component: Objectives, canActivate: [authGuard, consentGuard] },
  { path: 'quizzes/create', component: CreateQuiz, canActivate: [authGuard, consentGuard] },
  { path: 'quizzes/:quizId/answer', component: AnswerQuiz, canActivate: [authGuard, consentGuard] },
  { path: 'quizzes/:quizId/review/:studentId', component: QuizReview, canActivate: [authGuard, consentGuard] },
  { path: 'quizzes', component: QuizPage, canActivate: [authGuard, consentGuard] },
  { path: 'login', component: Login },
  { path: 'consent', component: ConsentPage, canActivate: [authGuard] },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard, consentGuard] },
  {
    path: 'admin/users',
    loadComponent: () => import('./features/admin-page/admin-page').then((m) => m.AdminPage),
    canActivate: [authGuard, adminGuard, consentGuard],
  },
  { path: '**', redirectTo: 'dashboard' },
];