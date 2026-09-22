import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated) {
    // User is logged in. Allow access.
    return true;
  } else {
    // User is NOT logged in. Redirect them to login.
    return router.createUrlTree(['/auth/login']);
  }
};
