import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { GroupsService } from './groups';

describe('GroupsService', () => {
  let service: GroupsService;
  let http: HttpTestingController;
  const base = `${environment.apiHost}/groups`;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(GroupsService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('loads group members from the detail endpoint', () => {
    const group = { id: 'g1', name: 'Group', createdAt: '2026-09-29' };
    const details = { ...group, students: [{ id: 's1', name: 'Student', addedAt: '2026-09-29' }] };
    service.getGroups().subscribe((groups) => expect(groups).toEqual([details]));
    http.expectOne(base).flush([group]);
    http.expectOne(`${base}/g1`).flush(details);
  });

  it('emits an empty list when there are no groups', () => {
    service.getGroups().subscribe((groups) => expect(groups).toEqual([]));
    http.expectOne(base).flush([]);
  });

  it('uses the singular user endpoint and excludes non-students', () => {
    service.getStudents().subscribe((students) => expect(students.map((student) => student.id)).toEqual(['s1', 's2', 's3']));
    http.expectOne(`${environment.apiHost}/user`).flush([
      { id: 's1', role: 3 }, { id: 's2', role: 'Student' }, { id: 's3', role: '3' },
      { id: 'teacher', role: 2 }, { id: 'admin', role: 'Administrator' },
    ]);
  });

  it('sends the group and membership payloads expected by the backend', () => {
    service.createGroup('Group').subscribe();
    const create = http.expectOne(base);
    expect(create.request.method).toBe('POST');
    expect(create.request.body).toEqual({ name: 'Group' });
    create.flush({ id: 'g1', name: 'Group' });

    service.renameGroup('g1', 'Renamed').subscribe();
    const rename = http.expectOne(`${base}/g1`);
    expect(rename.request.method).toBe('PATCH');
    expect(rename.request.body).toEqual({ name: 'Renamed' });
    rename.flush({ id: 'g1', name: 'Renamed' });

    service.addMembers('g1', ['s1']).subscribe();
    const add = http.expectOne(`${base}/g1/members`);
    expect(add.request.method).toBe('POST');
    expect(add.request.body).toEqual({ studentIds: ['s1'] });
    add.flush(null);

    service.removeMembers('g1', ['s1']).subscribe();
    const remove = http.expectOne(`${base}/g1/members`);
    expect(remove.request.method).toBe('DELETE');
    expect(remove.request.body).toEqual({ studentIds: ['s1'] });
    remove.flush(null);

    service.deleteGroup('g1').subscribe();
    const deletion = http.expectOne(`${base}/g1`);
    expect(deletion.request.method).toBe('DELETE');
    deletion.flush(null);
  });
});
