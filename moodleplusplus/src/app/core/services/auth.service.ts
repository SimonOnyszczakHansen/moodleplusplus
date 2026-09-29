import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, finalize, map, of, shareReplay, tap, throwError } from 'rxjs';
import { LoginResponse, User } from '../models/user.interface';
import { environment } from '../../../environments/environment';

// Backend returns role as a numeric enum on /auth/login (JWT cookie claim has it as a string,
// but that cookie is HttpOnly and unreadable from JS). Confirmed mapping from backend Swagger:
const ROLE_MAP: Record<number, string> = {
  1: 'Administrator',
  2: 'Teacher',
  3: 'Student',
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'accessToken';
  private readonly USER_KEY = 'currentUser';
  private readonly CONSENT_KEY = 'consentAccepted';
  private refreshRequest$: Observable<void> | null = null;

  private userSubject = new BehaviorSubject<User | null>(this.readStoredUser());
  user$: Observable<User | null> = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }): Observable<User> {
    return this.http.post<LoginResponse>(`${environment.apiHost}/auth/login`, credentials).pipe(
      map((response) => {
        const token = response.jwt ?? response.accessToken ?? '';
        const rawRole = response.role;
        const role = typeof rawRole === 'number' ? (ROLE_MAP[rawRole] ?? 'Student') : (rawRole ?? 'Student');
        const user: User = {
          id: response.userId ?? response.id ?? null,
          email: credentials.email,
          name: response.name ?? 'Bruger',
          role: this.normalizeRole(response.role),
        };
        if (!response.isMissingConsents) {
          localStorage.setItem(this.CONSENT_KEY, 'true');
        }
        else {
          localStorage.setItem(this.CONSENT_KEY, 'false');
        }
        if (token) {
          localStorage.setItem(this.TOKEN_KEY, token);
        } else {
          localStorage.removeItem(this.TOKEN_KEY);
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
    );
  }

  refreshAccessToken(): Observable<void> {
    if (!this.refreshRequest$) {
      this.refreshRequest$ = this.http.post<void>(`${environment.apiHost}/auth/refresh`, {}).pipe(
        catchError((error: unknown) => {
          this.clearSession();
          this.userSubject.next(null);
          return throwError(() => error);
        }),
        finalize(() => {
          this.refreshRequest$ = null;
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    }

    return this.refreshRequest$;
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  get isAdmin(): boolean {
    return this.isAuthenticated && ['1', 'administrator', 'admin'].includes(String(this.currentUser?.role).toLowerCase());
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
    this.userSubject.next(null);
  }

  private readStoredUser(): User | null {
    const rawUser = localStorage.getItem(this.USER_KEY);
    if (!rawUser) {
      return null;
    }

    try {
      const parsed = JSON.parse(rawUser) as User;
      if (!parsed?.name) {
        return null;
      }

      const user = { ...parsed, role: this.normalizeRole(parsed.role) };
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      return user;
    } catch {
      return null;
    }
  }

  private normalizeRole(role: string | number | null | undefined): string {
    const normalized = String(role ?? '').toLowerCase();
    const roleNames: Record<string, string> = {
      '1': 'administrator',
      '2': 'teacher',
      '3': 'student',
    };

    return roleNames[normalized] ?? (normalized || 'student');
  }
}
