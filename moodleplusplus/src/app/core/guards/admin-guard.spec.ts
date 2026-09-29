import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, provideRouter } from '@angular/router';
import { adminGuard } from './admin-guard';

describe('adminGuard', () => {
  const runGuard = () => TestBed.runInInjectionContext(() =>
    adminGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
  );

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideRouter([])] });
  });

  afterEach(() => localStorage.clear());

  it('redirects unauthenticated visitors to login', () => {
    expect(runGuard()).toEqual(TestBed.inject(Router).createUrlTree(['/login']));
  });

  for (const role of [1, '1', 'Administrator', 'admin']) {
    it(`allows administrator role ${JSON.stringify(role)}`, () => {
      localStorage.setItem('currentUser', JSON.stringify({ name: 'Admin', role }));
      expect(runGuard()).toBe(true);
    });
  }

  for (const role of [2, 3, 'teacher', 'student', 'unknown']) {
    it(`rejects role ${JSON.stringify(role)}`, () => {
      localStorage.setItem('currentUser', JSON.stringify({ name: 'User', role }));
      expect(runGuard()).toEqual(TestBed.inject(Router).createUrlTree(['/dashboard']));
    });
  }
});
