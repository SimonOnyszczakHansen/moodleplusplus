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
import { nonAdminGuard } from './core/guards/non-admin-guard';
import { SubjectTasks } from './features/subject-page/components/subject-tasks/subject-tasks';
import { SubjectStudents } from './features/subject-page/components/subject-students/subject-students';
import { SubjectGoals } from './features/subject-page/components/subject-goals/subject-goals';
import { Progression } from './features/progression/progression';
import { AdminPage } from './features/admin-page/admin-page';
import { SubmissionHistory } from './features/submission-history/submission-history';
import { nonAuthGuard } from './core/guards/non-auth-guard';
import { nonConsentGuard } from './core/guards/non-consent-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard, nonAdminGuard, consentGuard] },
  {
    path: 'groups',
    loadComponent: () => import('./features/groups-page/groups-page').then((m) => m.GroupsPage),
    canActivate: [authGuard, nonAdminGuard, consentGuard, teacherGuard],
  },
  { path: 'tasks', component: Task, canActivate: [authGuard, nonAdminGuard, consentGuard] },
  { path: 'tasks/:id', component: TaskDetails, canActivate: [authGuard, nonAdminGuard, consentGuard] },
  {
    path: 'tasks/:taskId/assignments/:assignmentId/history',
    component: SubmissionHistory,
    canActivate: [authGuard, nonAdminGuard, consentGuard],
  },
  { path: 'objectives/:subjectId', component: Objectives, canActivate: [authGuard, nonAdminGuard, consentGuard] },
  { path: 'quizzes/create', component: CreateQuiz, canActivate: [authGuard, nonAdminGuard, consentGuard] },
  { path: 'quizzes/:quizId/answer', component: AnswerQuiz, canActivate: [authGuard, nonAdminGuard, consentGuard] },
  {
    path: 'quizzes/:quizId/review/:studentId',
    component: QuizReview,
    canActivate: [authGuard, nonAdminGuard, consentGuard],
  },
  { path: 'quizzes', component: QuizPage, canActivate: [authGuard, nonAdminGuard, consentGuard] },
  { path: 'login', component: Login, canActivate: [nonAuthGuard] },
  { path: 'consent', component: ConsentPage, canActivate: [authGuard, nonConsentGuard] },
  { path: 'subjects', component: SubjectPage, canActivate: [authGuard, nonAdminGuard, consentGuard] },
  { path: 'subject/:id', component: SubjectOverview, canActivate: [authGuard, nonAdminGuard, consentGuard] },
  { path: 'subject/:id/tasks', component: SubjectTasks, canActivate: [authGuard, nonAdminGuard, consentGuard] },
  {
    path: 'subject/:id/students',
    component: SubjectStudents,
    canActivate: [authGuard, nonAdminGuard, consentGuard],
  },
  { path: 'subject/:id/goals', component: SubjectGoals, canActivate: [authGuard, nonAdminGuard, consentGuard] },
  {
    path: 'progress/students/:studentId/subjects/:subjectId',
    component: Progression,
    canActivate: [authGuard, nonAdminGuard, consentGuard],
  },
  {
    path: 'admin/users',
    component: AdminPage,
    canActivate: [authGuard, adminGuard, consentGuard],
  },
  { path: '**', redirectTo: 'dashboard' },
];
