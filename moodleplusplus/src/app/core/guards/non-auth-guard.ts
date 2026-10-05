import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const nonAuthGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated) {
    return true;
  }

  if (!auth.hasAcceptedConsent) {
    return router.createUrlTree(['/consent']);
  }

  return router.createUrlTree([auth.isAdmin ? '/admin/users' : '/dashboard']);};
