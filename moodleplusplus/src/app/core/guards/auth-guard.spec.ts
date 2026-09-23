import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router } from '@angular/router';
import { provideRouter, RouterModule } from '@angular/router';

import { authGuard } from './auth-guard';
import { consentGuard } from './consent-guard';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      providers: [provideRouter([])],
    });
  });

  it('should redirect to login when no token exists', () => {
    const router = TestBed.inject(Router);
    const result = executeGuard({} as any, {} as any);

    expect(result).toEqual(router.createUrlTree(['/login']));
  });

  it('should allow access when a valid auth token is present', () => {
    localStorage.setItem('accessToken', 'token');

    expect(executeGuard({} as any, {} as any)).toBe(true);
  });
});

describe('consentGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => consentGuard(...guardParameters));

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      providers: [provideRouter([])],
    });
  });

  it('should redirect to consent when user is logged in but has not accepted it', () => {
    localStorage.setItem('accessToken', 'token');
    const router = TestBed.inject(Router);

    expect(executeGuard({} as any, {} as any)).toEqual(router.createUrlTree(['/consent']));
  });

  it('should allow access when user is logged in and consent is accepted', () => {
    localStorage.setItem('accessToken', 'token');
    localStorage.setItem('consentAccepted', 'true');

    expect(executeGuard({} as any, {} as any)).toBe(true);
  });
});
