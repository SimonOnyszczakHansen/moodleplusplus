import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, switchMap } from 'rxjs';
import { User, LoginResponse } from '../models/user.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // THE PRIVATE BOARD (Only the service can write here)
  private userSubject = new BehaviorSubject<User | null>(null);

  // THE PUBLIC VIEW (Read-only for components)
  user$: Observable<User | null> = this.userSubject.asObservable();

  private readonly API_URL = '/auth';

  constructor(private http: HttpClient) {
    this.loadUserProfileOnStartup();
  }

  register(userData: any): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/register`, userData);
  }

  login(credentials: any): Observable<User> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials).pipe(
      // Save the "Key Card" (Token) to storage
      tap((response) => localStorage.setItem('accessToken', response.accessToken)),
      // Immediately fetch the full User Profile
      switchMap(() => this.http.get<User>(`${this.API_URL}/me`)),
      // Update the central state
      tap((user) => this.userSubject.next(user)),
    );
  }

  logout(): void {
    // 1. Remove the security key (Key Card) from storage
    localStorage.removeItem('accessToken');
    // 2. Clear the bulletin board
    this.userSubject.next(null);
  }

  private loadUserProfileOnStartup(): void {
    const token = localStorage.getItem('accessToken');
    if (token) {
      this.http.get<User>(`${this.API_URL}/me`).subscribe({
        next: (user) => this.userSubject.next(user),
        error: () => this.logout(),
      });
    }
  }

  get isAuthenticated(): boolean {
    return !!this.userSubject.value;
  }
}
