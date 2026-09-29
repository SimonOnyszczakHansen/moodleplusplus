import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const credentialedRequest = req.clone({ withCredentials: true });
  const isAuthRequest = /\/auth\/(login|logout|refresh)(?:\?|$)/.test(req.url);

  return next(credentialedRequest).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401 || isAuthRequest) {
        return throwError(() => error);
      }

      return authService.refreshAccessToken().pipe(
        switchMap(() => next(credentialedRequest)),
      );
    }),
  );
};

