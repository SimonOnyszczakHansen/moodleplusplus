import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { consentGuard } from './core/guards/consent-guard';
import { adminGuard } from './core/guards/admin-guard';
import { Dashboard } from './features/dashboard-page/dashboard';
import { ConsentPage } from './features/consent-page/consent-page';
import { Login } from './features/login-page/login';
import { SubjectPage } from './features/subject-page/subject-page';
import { SubjectOverview } from './features/subject-page/components/subject-overview/subject-overview';
import { Task } from './features/task-page/task';
import { TaskDetails } from './features/task-details/task-details';
import { Objectives } from './features/objectives/objectives';
import { QuizPage } from './features/quiz.page/quiz-page';
import { CreateQuiz } from './features/quiz.page/components/create-quiz/create-quiz';
import { AnswerQuiz } from './features/quiz.page/components/answer-quiz/answer-quiz';
import { QuizReview } from './features/quiz.page/components/quiz-review/quiz-review';
import { teacherGuard } from './core/guards/teacher-guard';
import { SubjectTasks } from './features/subject-page/components/subject-tasks/subject-tasks';
import { SubjectStudents } from './features/subject-page/components/subject-students/subject-students';
import { SubjectGoals } from './features/subject-page/components/subject-goals/subject-goals';
import { Progression } from './features/progression/progression';
import { AdminPage } from './features/admin-page/admin-page';
import { SubmissionHistory } from './features/submission-history/submission-history';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard, consentGuard] },
  {
    path: 'groups',
    loadComponent: () => import('./features/groups-page/groups-page').then((m) => m.GroupsPage),
    canActivate: [authGuard, consentGuard, teacherGuard],
  },
  { path: 'tasks', component: Task, canActivate: [authGuard, consentGuard] },
  { path: 'tasks/:id', component: TaskDetails, canActivate: [authGuard, consentGuard] },
  {
    path: 'tasks/:taskId/assignments/:assignmentId/history',
    component: SubmissionHistory,
    canActivate: [authGuard, consentGuard],
  },
  { path: 'objectives/:subjectId', component: Objectives, canActivate: [authGuard, consentGuard] },
  { path: 'quizzes/create', component: CreateQuiz, canActivate: [authGuard, consentGuard] },
  { path: 'quizzes/:quizId/answer', component: AnswerQuiz, canActivate: [authGuard, consentGuard] },
  {
    path: 'quizzes/:quizId/review/:studentId',
    component: QuizReview,
    canActivate: [authGuard, consentGuard],
  },
  { path: 'quizzes', component: QuizPage, canActivate: [authGuard, consentGuard] },
  { path: 'login', component: Login },
  { path: 'consent', component: ConsentPage, canActivate: [authGuard] },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard, consentGuard] },
  { path: 'subjects', component: SubjectPage, canActivate: [authGuard, consentGuard] },
  { path: 'subject/:id', component: SubjectOverview, canActivate: [authGuard, consentGuard] },
  { path: 'subject/:id/tasks', component: SubjectTasks, canActivate: [authGuard, consentGuard] },
  {
    path: 'subject/:id/students',
    component: SubjectStudents,
    canActivate: [authGuard, consentGuard],
  },
  { path: 'subject/:id/goals', component: SubjectGoals, canActivate: [authGuard, consentGuard] },
  {
    path: 'progress/students/:studentId/subjects/:subjectId',
    component: Progression,
    canActivate: [authGuard, consentGuard],
  },
  {
    path: 'admin/users',
    component: AdminPage,
    canActivate: [authGuard, adminGuard, consentGuard],
  },
  { path: '**', redirectTo: 'dashboard' },
];
