import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AdminUser } from '../models/admin-user';
import { CreateUserRequest } from '../models/creater-user-request';
import { UpdateUserRequest } from '../models/update-user-request';

@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  private readonly usersUrl = `${environment.apiHost}/user`;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(this.usersUrl, { withCredentials: true });
  }

  createUser(request: CreateUserRequest): Observable<void> {
    return this.http.post<void>(`${environment.apiHost}/auth/register`, request, {
      withCredentials: true,
    });
  }

  updateUser(id: string, request: UpdateUserRequest): Observable<AdminUser> {
    return this.http.put<AdminUser>(`${this.usersUrl}/${encodeURIComponent(id)}`, request, {
      withCredentials: true,
    });
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.usersUrl}/${encodeURIComponent(id)}`, {
      withCredentials: true,
    });
  }
}
