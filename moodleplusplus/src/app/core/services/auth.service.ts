import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap, of } from 'rxjs';
import { LoginResponse, User } from '../models/user.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'accessToken';
  private readonly USER_KEY = 'currentUser';
  private readonly CONSENT_KEY = 'consentAccepted';

  private userSubject = new BehaviorSubject<User | null>(this.readStoredUser());
  user$: Observable<User | null> = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }): Observable<User> {
    // Quick local dev fallback so you can test without the API.
    if (credentials.email === 'test@test.dk' && credentials.password === 'Kode1234!') {
      const user: User = {
        id: 'local-test',
        email: 'test@test.dk',
        name: 'Test Bruger',
        role: 'student',
      };

      const devToken = 'local-dev-token';
      localStorage.setItem(this.TOKEN_KEY, devToken);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      this.userSubject.next(user);

      return of(user);
    }
    // Remove above later

    return this.http.post<LoginResponse>(`${environment.apiHost}/auth/login`, credentials).pipe(
      map((response) => {
        const token = response.jwt ?? response.accessToken ?? '';
        const user: User = {
          id: response.userId ?? response.id ?? null,
          email: credentials.email,
          name: response.name ?? 'Bruger',
          role: response.role ?? 'student',
        };

        if (token) {
          localStorage.setItem(this.TOKEN_KEY, token);
        }

        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this.userSubject.next(user);

        return user;
      }),
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${environment.apiHost}/auth/logout`, {}).pipe(
      tap(() => this.clearSession()),
      tap(() => this.userSubject.next(null)),
    );
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  get hasAcceptedConsent(): boolean {
    return localStorage.getItem(this.CONSENT_KEY) === 'true';
  }

  markConsentAccepted(): void {
    localStorage.setItem(this.CONSENT_KEY, 'true');
  }

  get isAuthenticated(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY) || !!this.userSubject.value;
  }

  clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.CONSENT_KEY);
  }

  private readStoredUser(): User | null {
    const rawUser = localStorage.getItem(this.USER_KEY);
    if (!rawUser) {
      return null;
    }

    try {
      const parsed = JSON.parse(rawUser) as User;
      return parsed?.name ? parsed : null;
    } catch {
      return null;
    }
  }
}
