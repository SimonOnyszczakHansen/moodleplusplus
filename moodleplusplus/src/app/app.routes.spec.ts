import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { AdminPage } from './features/admin-page/admin-page';
import { ConsentPage } from './features/consent-page/consent-page';
import { Dashboard } from './features/dashboard-page/dashboard';
import { Login } from './features/login-page/login';

describe('role-based routing', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter(routes)],
    });
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    localStorage.clear();
  });

  function signIn(role: string | number, consent = true): void {
    localStorage.setItem('currentUser', JSON.stringify({ name: 'User', role }));
    localStorage.setItem('consentAccepted', String(consent));
  }

  it.each([
    '/', '/dashboard', '/subjects', '/subject/1', '/groups', '/tasks', '/tasks/1',
    '/tasks/1/assignments/2/history', '/objectives/1', '/quizzes', '/quizzes/create',
    '/quizzes/1/answer', '/quizzes/1/review/2', '/unknown-page', '/admin/users',
    '/subject/1/tasks', '/subject/1/students', '/subject/1/goals',
    '/progress/students/1/subjects/2',
  ])('opens only user management for an administrator visiting %s', async (url) => {
    signIn(1);
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url, AdminPage);
    expect(TestBed.inject(Router).url).toBe('/admin/users');
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(`${environment.apiHost}/user`).flush([]);
    http.expectNone(() => true);
  });

  it.each(['1', 'Administrator', 'admin'])('recognizes administrator role %s on direct navigation', async (role) => {
    signIn(role);
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/dashboard', AdminPage);
    TestBed.inject(HttpTestingController).expectOne(`${environment.apiHost}/user`).flush([]);
  });

  it('requires consent before opening user management for an administrator', async () => {
    signIn(1, false);
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/dashboard', ConsentPage);
    expect(TestBed.inject(Router).url).toBe('/consent');
    TestBed.inject(HttpTestingController).expectNone(() => true);
  });

  it('redirects unauthenticated visitors to login without requesting data', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/dashboard', Login);
    TestBed.inject(HttpTestingController).expectNone(() => true);
  });

  it.each([
    [2, '/dashboard/teacher/me', '/subject/getAllMySubjectsByTeacherId'],
    [3, '/dashboard/me', '/subject/getAllMySubjects'],
  ])('keeps the dashboard available for role %s', async (role, dashboardUrl, subjectsUrl) => {
    signIn(role);
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/dashboard', Dashboard);
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(`${environment.apiHost}${subjectsUrl}`).flush([]);
    http.expectOne(`${environment.apiHost}${dashboardUrl}`).flush({
      [role === 2 ? 'assignments' : 'tasks']: { items: [], totalCount: 0 },
    });
    expect(TestBed.inject(Router).url).toBe('/dashboard');
  });
});
