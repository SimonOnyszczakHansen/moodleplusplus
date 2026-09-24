import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ISubject } from '../models/subjects.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SubjectsService {
  constructor(private http: HttpClient) {}

  getSubjectsData(): Observable<ISubject[]> {
    return of([
      { id: 1, name: 'Programmering' },
      { id: 2, name: 'Databaser' },
      { id: 3, name: 'Matematik' },
    ]);

    return this.http.get<ISubject[]>(`${environment.apiHost}/subjects`);
  }
}
