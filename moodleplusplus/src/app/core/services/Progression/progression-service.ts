import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IStudentSubjectProgress } from '../../models/allstudentsprogress.model';

@Injectable({
  providedIn: 'root',
})
export class ProgressionService {
  	private readonly base = `${environment.apiHost}/progress`;

	constructor(private http: HttpClient) { }

	getStudentSubjectProgress(userId: string, subjectId: string): Observable<IStudentSubjectProgress> {
		return this.http.get<IStudentSubjectProgress>(`${this.base}/students/${userId}/subjects/${subjectId}`);
	}

	getTaskProgress(userId: string, taskId: string): Observable<IStudentSubjectProgress> {
		return this.http.get<IStudentSubjectProgress>(`${this.base}/students/${userId}/tasks/${taskId}`);
	}
}
