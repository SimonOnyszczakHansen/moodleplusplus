import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../../environments/environment';

import { DashboardService } from './dashboard';
import { AuthService } from '../../../core/services/auth.service';

describe('Dashboard', () => {
  let service: DashboardService;
  let http: HttpTestingController;
  let auth: { isTeacher: boolean };

  beforeEach(() => {
    auth = { isTeacher: false };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: auth },
      ],
    });
    service = TestBed.inject(DashboardService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads dashboard data with credentials', () => {
    service.getDashboardData().subscribe();
    const request = http.expectOne(`${environment.apiHost}/dashboard/me`);
    expect(request.request.withCredentials).toBe(true);
    request.flush({ studentName: 'Daniel', tasks: { items: [], totalCount: 0 } });
  });

  it('maps the full assignment response into task previews', () => {
    let tasks: unknown;
    service.getAllTasks().subscribe((data) => tasks = data);
    const request = http.expectOne(`${environment.apiHost}/task-assignments/me`);
    expect(request.request.withCredentials).toBe(true);
    request.flush([0, 1, 2, 3].map((status) => ({
      assignmentId: `assignment-${status}`,
      task: { id: 'task', subjectId: 'subject', title: 'OOP' },
      deadline: '2026-10-09T15:46:00Z',
      status,
    })));
    expect(tasks).toEqual(['NotSubmitted', 'AwaitingReview', 'Approved', 'Rejected'].map((status, index) => ({
      assignmentId: `assignment-${index}`,
      taskId: 'task',
      subjectId: 'subject',
      title: 'OOP',
      deadline: '2026-10-09T15:46:00Z',
      status,
    })));
  });

  it('uses the teacher dashboard endpoint for a logged-in teacher', () => {
    auth.isTeacher = true;
    service.getDashboardData().subscribe();
    const request = http.expectOne(`${environment.apiHost}/dashboard/teacher/me`);
    expect(request.request.withCredentials).toBe(true);
    http.expectNone(`${environment.apiHost}/dashboard/me`);
    request.flush({});
  });
});
