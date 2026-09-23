import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IConsentRequest } from '../models/consent-request.model';
import { environment } from '../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class Consent {
	constructor(private http: HttpClient) { }

	submitConsent(consent: IConsentRequest): Observable<void> {
		return this.http.post<void>(`${environment.apiUrl}/api/v1/Auth/consent`, consent);
	}
}
