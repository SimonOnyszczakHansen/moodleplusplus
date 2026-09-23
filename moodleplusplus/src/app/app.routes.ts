import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { consentGuard } from './core/guards/consent-guard';
import { Dashboard } from './features/dashboard-page/dashboard';
import { ConsentPage } from './features/consent-page/consent-page';
import { Login } from './features/login-page/login';
import { Task } from './features/task-page/task';
import { TaskDetails } from './features/task-page/task-details/task-details';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'tasks', component: Task },
  { path: 'tasks/:assignmentId', component: TaskDetails },
  { path: 'login', component: Login },
  { path: 'consent', component: ConsentPage },
  { path: 'dashboard', component: Dashboard },
  { path: '**', redirectTo: 'login' },
];
