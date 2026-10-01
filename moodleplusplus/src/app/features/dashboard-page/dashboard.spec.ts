import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { Subject, of } from 'rxjs';
import { SubjectsService } from '../subject-page/services/subjects';
import { Dashboard } from './dashboard';
import { IDashboard, ITeacherDashboard } from './models/dashboard.model';
import { DashboardService } from './services/dashboard';
import { AuthService } from '../../core/services/auth.service';

const response: IDashboard = {
  studentId: 'e10a5846-af60-42a4-9911-568fd8ed0096',
  studentName: 'Daniel',
  summary: {
    tasks: { assigned: 2, approved: 0, awaitingReview: 0, rejected: 0, notSubmitted: 2, completionPercentage: 0 },
    quizzes: { assigned: 0, completed: 0, passed: 0, failed: 0, completionPercentage: 0 },
  },
  tasks: {
    items: [
      {
        assignmentId: '7e972cf2-467e-4a7c-8f8c-2c7fcbc693fe',
        taskId: '9b260814-22e3-491d-9b20-89a3cc9753f6',
        title: 'wddwqonjoj',
        subjectId: 'e1281003-4702-4342-94b3-31d03aa59121',
        recipientType: 'student', groupId: null, status: 'NotSubmitted',
        assignedAt: '2026-09-29T09:41:41.033175+00:00',
        deadline: '2026-10-09T15:46:00+00:00',
        submittedAt: '0001-01-01T00:00:00+00:00', feedbackCount: 0,
      },
      {
        assignmentId: '8d994861-8e04-46ac-90fc-72436a76c381',
        taskId: 'b26f6b09-76f8-4cad-bbb5-0dad202c00ff',
        title: 'OOP Opgave',
        subjectId: '1441c88a-8c12-4930-b693-7f05bd4c7579',
        recipientType: 'student', groupId: null, status: 'NotSubmitted',
        assignedAt: '2026-09-29T08:38:19.180015+00:00',
        deadline: '2026-10-16T11:02:00+00:00',
        submittedAt: '0001-01-01T00:00:00+00:00', feedbackCount: 0,
      },
    ],
    totalCount: 2, page: 1, pageSize: 10,
  },
  quizzes: { items: [], totalCount: 0, page: 1, pageSize: 10 },
  recentFeedback: { items: [], totalCount: 0, page: 1, pageSize: 10 },
};

const teacherResponse: ITeacherDashboard = {
  teacherId: 'f13d9292-5c29-4a46-a928-fc566e191849',
  teacherName: 'Daniel Teacher',
  email: 'dteacher@example.com',
  subjects: {
    items: [{ id: 'fc86f05c-2bd6-4ebf-8218-08f150afb57b', name: 'Daniel Test Fag' }],
    totalCount: 1, page: 1, pageSize: 10,
  },
  tasks: {
    items: [{
      id: '3ad42a33-dd32-4f41-b93c-97dfdec6bba3',
      subjectId: 'fc86f05c-2bd6-4ebf-8218-08f150afb57b',
      title: 'Daniels Opgave',
      description: 'Opgave beskrivelse',
      deadline: '2026-10-02T23:59:00+00:00',
    }],
    totalCount: 1, page: 1, pageSize: 10,
  },
  assignments: {
    items: [{
      assignmentId: '47854651-87c7-48d0-ab3e-9fdafb202d3d',
      taskId: '3ad42a33-dd32-4f41-b93c-97dfdec6bba3',
      title: 'Daniels Opgave',
      subjectId: 'fc86f05c-2bd6-4ebf-8218-08f150afb57b',
      recipientType: 'student',
      recipientId: 'e10a5846-af60-42a4-9911-568fd8ed0096',
      recipientName: 'Daniel',
      status: 'NotSubmitted',
      assignedAt: '2026-09-30T12:16:10.885691+00:00',
      deadline: '2026-10-02T23:59:00+00:00',
    }],
    totalCount: 1, page: 1, pageSize: 10,
  },
};

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let requests: Subject<IDashboard>;
  const getAllTasks = vi.fn();

  beforeEach(async () => {
    requests = new Subject<IDashboard>();
    getAllTasks.mockReset();
    getAllTasks.mockReturnValue(of([]));
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideRouter([]),
        { provide: DashboardService, useValue: { getDashboardData: () => requests, getAllTasks } },
        { provide: SubjectsService, useValue: { getMySubjects: () => of([
          { id: response.tasks.items[0].subjectId, name: 'Programmering' },
          { id: response.tasks.items[1].subjectId, name: 'OOP' },
          { id: 'no-tasks', name: 'ITSM' },
        ]) } },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('renders the paginated backend response and links to assignments', async () => {
    expect(fixture.nativeElement.textContent).toContain('Indlæser dashboard');
    requests.next(response);
    await fixture.whenStable();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('h1')?.textContent).toContain('Daniel');
    expect(element.querySelectorAll('.subject-card').length).toBe(3);
    expect(element.textContent).toContain('0 af 1 godkendt');
    expect(element.textContent).toContain('Ingen opgaver endnu');
    expect(element.textContent).not.toContain('Quizzer');
    expect(element.querySelector('.summary-container')).toBeNull();
    const cards = element.querySelectorAll<HTMLAnchorElement>('.deadline-card');
    expect(cards.length).toBe(2);
    expect(cards[0].textContent).toContain('wddwqonjoj');
    expect(cards[0].textContent).toContain('09-10-2026');
    expect(cards[0].textContent).toContain('Programmering');
    expect(cards[1].textContent).toContain('OOP Opgave');
    expect(cards[0].getAttribute('href')).toBe(`/tasks/${response.tasks.items[0].assignmentId}`);
    expect(element.textContent).not.toContain('0001');
    expect(getAllTasks).not.toHaveBeenCalled();
  });

  it('sorts pending tasks, excludes submitted tasks, and handles missing deadlines', async () => {
    const task = response.tasks.items[0];
    requests.next({
      ...response,
      tasks: { ...response.tasks, totalCount: 5, items: [
        { ...task, assignmentId: 'no-deadline', deadline: null },
        { ...task, assignmentId: 'approved', status: 'Approved' },
        { ...task, assignmentId: 'review', status: 'AwaitingReview' },
        { ...task, assignmentId: 'later', deadline: '2026-10-20T12:00:00Z' },
        { ...task, assignmentId: 'rejected', status: 'Rejected' },
      ] },
    });
    await fixture.whenStable();
    expect(component.pendingTasks().map((item) => item.assignmentId)).toEqual([
      'rejected', 'later', 'no-deadline',
    ]);
    expect(fixture.nativeElement.textContent).toContain('Ingen deadline');
    expect(component.subjectCards()[0].progress).toBe(20);
    expect(component.subjectCards()[0].approved).toBe(1);
  });

  it('shows an empty state without requiring summaries, quizzes, or feedback', async () => {
    requests.next({
      studentId: response.studentId,
      studentName: response.studentName,
      tasks: { ...response.tasks, items: [], totalCount: 0 },
    });
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Ingen afventende afleveringer.');
    expect(component.subjectCards().every((subject) => subject.progress === 0)).toBe(true);
  });

  it('uses all assignments for progress and deadline order when the response is paginated', async () => {
    const task = response.tasks.items[0];
    getAllTasks.mockReturnValue(of([
      { ...task, status: 'Approved' },
      { ...task, assignmentId: 'earlier', deadline: '2026-10-01T12:00:00Z' },
      response.tasks.items[1],
    ]));
    requests.next({ ...response, tasks: { ...response.tasks, totalCount: 3 } });
    await fixture.whenStable();
    expect(getAllTasks).toHaveBeenCalledOnce();
    expect(component.subjectCards()[0].progress).toBe(50);
    expect(component.subjectCards()[1].progress).toBe(0);
    expect(component.pendingTasks()[0].assignmentId).toBe('earlier');
    expect(fixture.nativeElement.querySelector('[role="progressbar"]').getAttribute('aria-valuenow')).toBe('50');
  });

  it('shows a fetch error and lets the user retry', async () => {
    requests.error(new Error('Network error'));
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
    expect(fixture.nativeElement.textContent).not.toContain('Ingen afventende afleveringer');

    requests = new Subject<IDashboard>();
    fixture.nativeElement.querySelector('button').click();
    requests.next(response);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.deadline-card').length).toBe(2);
  });
});

describe('Dashboard HTTP requests', () => {
  let fixture: ComponentFixture<Dashboard>;
  let http: HttpTestingController;
  let auth: { isTeacher: boolean };

  beforeEach(async () => {
    auth = { isTeacher: false };
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: auth },
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('does not cancel the dashboard request when subjects fail first', async () => {
    fixture = TestBed.createComponent(Dashboard);
    await fixture.whenStable();
    const dashboard = http.expectOne(`${environment.apiHost}/dashboard/me`);
    const subjects = http.expectOne(`${environment.apiHost}/subject/getAllMySubjects`);
    subjects.flush({}, { status: 403, statusText: 'Forbidden' });

    expect(dashboard.cancelled).toBe(false);
    dashboard.flush(response);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Daniel');
    expect(fixture.nativeElement.querySelectorAll('.deadline-card').length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('Fagene kunne ikke indlæses.');
    expect(fixture.nativeElement.textContent).not.toContain('Du har ingen fag endnu.');

    fixture.nativeElement.querySelector('[role="alert"] button').click();
    http.expectOne(`${environment.apiHost}/dashboard/me`).flush(response);
    http.expectOne(`${environment.apiHost}/subject/getAllMySubjects`).flush([
      { id: response.tasks.items[0].subjectId, name: 'Programmering' },
    ]);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.subject-card').length).toBe(1);
  });

  it('renders teacher assignments and links to task IDs using the teacher response', async () => {
    auth.isTeacher = true;
    fixture = TestBed.createComponent(Dashboard);
    await fixture.whenStable();

    http.expectOne(`${environment.apiHost}/dashboard/teacher/me`).flush(teacherResponse);
    http.expectOne(`${environment.apiHost}/subject/getAllMySubjectsByTeacherId`)
      .flush(teacherResponse.subjects.items);
    http.expectNone(`${environment.apiHost}/subject/getAllMySubjects`);
    await fixture.whenStable();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('h1')?.textContent).toContain('Daniel Teacher');
    expect(element.querySelector('.subject-card')?.textContent).toContain('Daniel Test Fag');
    expect(element.querySelector('.subject-card')?.textContent).toContain('0 af 1 godkendt');
    const cards = element.querySelectorAll<HTMLAnchorElement>('.deadline-card');
    expect(cards.length).toBe(1);
    expect(cards[0].textContent).toContain('Daniels Opgave');
    expect(cards[0].textContent).toContain('Daniel');
    expect(cards[0].textContent).toContain('Ikke afleveret');
    expect(cards[0].querySelector('.deadline-date')?.textContent?.trim()).toBeTruthy();
    expect(cards[0].getAttribute('href')).toBe(`/tasks/${teacherResponse.tasks.items[0].id}`);
    expect(element.textContent).not.toContain('Ingen afventende afleveringer.');
    http.expectNone(`${environment.apiHost}/task-assignments/me`);
  });

  it('keeps paginated teacher assignments separate from the student assignment endpoint', async () => {
    auth.isTeacher = true;
    fixture = TestBed.createComponent(Dashboard);
    await fixture.whenStable();
    http.expectOne(`${environment.apiHost}/dashboard/teacher/me`).flush({
      ...teacherResponse,
      tasks: { ...teacherResponse.tasks, totalCount: 2 },
      assignments: { ...teacherResponse.assignments, totalCount: 2 },
    });
    http.expectOne(`${environment.apiHost}/subject/getAllMySubjectsByTeacherId`)
      .flush(teacherResponse.subjects.items);
    await fixture.whenStable();

    http.expectNone(`${environment.apiHost}/task-assignments/me`);
    expect(fixture.nativeElement.querySelectorAll('.deadline-card').length).toBe(1);
    expect(fixture.nativeElement.querySelector('[role="progressbar"]')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Se alle opgaver for flere afleveringer.');
  });
});
