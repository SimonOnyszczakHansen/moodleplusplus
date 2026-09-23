import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { consentGuard } from './core/guards/consent-guard';
import { Dashboard } from './features/dashboard-page/dashboard';
import { ConsentPage } from './features/consent-page/consent-page';
import { Login } from './features/login-page/login';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'consent', component: ConsentPage, canActivate: [authGuard] },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard, consentGuard] },
  { path: '**', redirectTo: 'login' },
];
