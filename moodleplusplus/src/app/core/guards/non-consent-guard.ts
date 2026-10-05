import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const nonConsentGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.hasAcceptedConsent) {
    return true;
  }

  return router.createUrlTree([auth.isAdmin ? '/admin/users' : '/dashboard']);
};
