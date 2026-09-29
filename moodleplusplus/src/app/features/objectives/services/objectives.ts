import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { IObjective } from '../../../core/models/educationgoal.model';
import { IApiGoal, ICreateObjectiveRequest, IUpdateObjectiveRequest, mapApiGoal } from '../models/objective.model';

@Injectable({
  providedIn: 'root',
})
export class Objectives {
	private readonly base = `${environment.apiHost}/Goal`;

	constructor(private http: HttpClient) { }

	getObjectivesBySubject(subjectId: string): Observable<IObjective[]> {
		return this.http
			.get<IApiGoal[]>(`${this.base}/subjectid/${subjectId}`)
			.pipe(map((goals) => goals.map(mapApiGoal)));
	}

	createObjective(request: ICreateObjectiveRequest): Observable<void> {
		return this.http.post<void>(this.base, request);
	}

	updateObjective(id: string, request: IUpdateObjectiveRequest): Observable<void> {
		return this.http.patch<void>(`${this.base}/${id}`, request);
	}

	deleteObjective(id: string): Observable<void> {
		return this.http.delete<void>(`${this.base}/${id}`);
	}
}
