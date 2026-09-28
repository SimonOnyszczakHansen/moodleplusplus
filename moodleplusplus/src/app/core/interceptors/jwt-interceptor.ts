import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Get the access token from storage (set during login)
  const token = localStorage.getItem('accessToken');

  // Send the auth cookie (if backend uses one) and the Bearer token (if backend returned one) together.
  const cloned = req.clone({
    withCredentials: true,
    ...(token ? { setHeaders: { Authorization: `Bearer ${token}` } } : {}),
  });
  return next(cloned);
};

