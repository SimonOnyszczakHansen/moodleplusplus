import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { IConsentRequest } from '../models/consent-request.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Consent {
  constructor(private http: HttpClient) {}

  submitConsent(consent: IConsentRequest): Observable<void> {
    // If using the local dev token, short-circuit and persist consent locally
    if (localStorage.getItem('accessToken') === 'local-dev-token') {
      return of(void 0);
    }
    // Remove above later

    return this.http.patch<void>(`${environment.apiHost}/consent`, consent);
  }
}
