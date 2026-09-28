import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { consentGuard } from './core/guards/consent-guard';
import { Dashboard } from './features/dashboard-page/dashboard';
import { ConsentPage } from './features/consent-page/consent-page';
import { Login } from './features/login-page/login';
import { Task } from './features/task-page/task';
import { TaskDetails } from './features/task-details/task-details';
import { Objectives } from './features/objectives/objectives';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard, consentGuard] },
  { path: 'tasks', component: Task, canActivate: [authGuard, consentGuard] },
  { path: 'tasks/:id', component: TaskDetails, canActivate: [authGuard, consentGuard] },
  { path: 'objectives/:subjectId', component: Objectives, canActivate: [authGuard, consentGuard] },
  { path: 'login', component: Login },
  { path: 'consent', component: ConsentPage, canActivate: [authGuard] },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard, consentGuard] },
  { path: '**', redirectTo: 'dashboard' },
];
