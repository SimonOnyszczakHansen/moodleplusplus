import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { AdminUsersService } from './admin-users';

describe('AdminUsersService', () => {
  let service: AdminUsersService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(AdminUsersService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads users with session credentials', () => {
    service.getUsers().subscribe((users) => expect(users).toEqual([]));
    const request = http.expectOne(`${environment.apiHost}/user`);
    expect(request.request.method).toBe('GET');
    expect(request.request.withCredentials).toBe(true);
    request.flush([]);
  });

  it('registers a user without replacing the administrator session', () => {
    localStorage.setItem('accessToken', 'admin-token');
    const user = { name: 'User', email: 'user@example.com', password: 'password', role: 3 };
    service.createUser(user).subscribe();
    const request = http.expectOne(`${environment.apiHost}/auth/register`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(user);
    request.flush(null, { status: 201, statusText: 'Created' });
    expect(localStorage.getItem('accessToken')).toBe('admin-token');
    localStorage.removeItem('accessToken');
  });

  it('updates only name and email using PUT', () => {
    const user = { name: 'Updated', email: 'updated@example.com' };
    service.updateUser('user-id', user).subscribe();
    const request = http.expectOne(`${environment.apiHost}/user/user-id`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(user);
    request.flush({ id: 'user-id', ...user, role: 3 });
  });

  it('handles a successful deletion with no response body', () => {
    service.deleteUser('user-id').subscribe();
    const request = http.expectOne(`${environment.apiHost}/user/user-id`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null, { status: 204, statusText: 'No Content' });
  });
});
