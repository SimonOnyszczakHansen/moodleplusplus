import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, provideRouter } from '@angular/router';
import { teacherGuard } from './teacher-guard';

describe('teacherGuard', () => {
  const runGuard = () => TestBed.runInInjectionContext(() => teacherGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideRouter([])] });
  });
  afterEach(() => localStorage.clear());

  for (const role of [2, '2', 'Teacher', 'teacher']) {
    it(`allows teacher role ${role}`, () => {
      localStorage.setItem('currentUser', JSON.stringify({ name: 'Teacher', role }));
      expect(runGuard()).toBe(true);
    });
  }
  for (const role of [1, 3, 'Student', 'Administrator']) {
    it(`rejects role ${role}`, () => {
      localStorage.setItem('currentUser', JSON.stringify({ name: 'User', role }));
      expect(runGuard()).toEqual(TestBed.inject(Router).createUrlTree(['/dashboard']));
    });
  }
});
