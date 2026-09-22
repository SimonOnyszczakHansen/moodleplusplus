import { Routes } from '@angular/router';
import { Dashboard } from './features/dashboard-page/dashboard';
import { Login } from './features/login-page/login';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'login', component: Login },
  { path: '**', redirectTo: 'login' },
];
