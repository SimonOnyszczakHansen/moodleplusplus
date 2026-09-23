import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { consentGuard } from './core/guards/consent-guard';
import { Dashboard } from './features/dashboard-page/dashboard';
import { Consent } from './features/consent-page/consent';
import { Login } from './features/login-page/login';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'consent', component: Consent, canActivate: [authGuard] },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard, consentGuard] },
  { path: '**', redirectTo: 'login' },
];
