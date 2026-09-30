import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Group, GroupDetails, GroupStudent } from '../models/group.model';

@Injectable({ providedIn: 'root' })
export class GroupsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiHost}/groups`;

  getGroups(): Observable<GroupDetails[]> {
    // The list endpoint contains no members; fetch details for each card.
    return this.http.get<Group[]>(this.base).pipe(
      switchMap((groups) => groups.length
        ? forkJoin(groups.map((group) => this.getGroup(group.id)))
        : of([])),
    );
  }

  getGroup(id: string): Observable<GroupDetails> {
    return this.http.get<GroupDetails>(`${this.base}/${id}`);
  }

  getStudents(): Observable<GroupStudent[]> {
    return this.http.get<GroupStudent[]>(`${environment.apiHost}/user`).pipe(
      map((users) => users.filter((user) => ['3', 'student'].includes(String(user.role).toLowerCase()))),
    );
  }

  createGroup(name: string): Observable<Group> {
    return this.http.post<Group>(this.base, { name });
  }

  renameGroup(id: string, name: string): Observable<Group> {
    return this.http.patch<Group>(`${this.base}/${id}`, { name });
  }

  addMembers(id: string, studentIds: string[]): Observable<void> {
    return this.http.post<void>(`${this.base}/${id}/members`, { studentIds });
  }

  removeMembers(id: string, studentIds: string[]): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}/members`, { body: { studentIds } });
  }

  deleteGroup(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
