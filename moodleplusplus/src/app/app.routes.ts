import { Routes } from '@angular/router';
import { Dashboard } from './presentation/dashboard-page/dashboard/dashboard';
import { Login } from './presentation/login-page/login/login';

export const routes: Routes = [
	{ path: '', redirectTo: 'login', pathMatch: 'full' },
	{ path: 'dashboard', component: Dashboard },
	{ path: 'login', component: Login },
	{ path: '**', redirectTo: 'login' }
];
