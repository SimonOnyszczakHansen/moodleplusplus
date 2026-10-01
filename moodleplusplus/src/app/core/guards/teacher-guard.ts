import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const teacherGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isTeacher || inject(Router).createUrlTree(['/dashboard']);
};
