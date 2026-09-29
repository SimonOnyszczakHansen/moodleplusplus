import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [NgIf, RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  get showNavigation(): boolean {
    return this.authService.isAuthenticated && this.authService.hasAcceptedConsent;
  }

  get currentUserName(): string {
    return this.authService.currentUser?.name ?? 'Bruger';
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin;
  }

  get currentUserRole(): string {
    // UI-facing Danish label; AuthService/User.role stays in its original casing for logic checks.
    const roleLabels: Record<string, string> = {
      Student: 'Elev',
      Teacher: 'Underviser',
      Administrator: 'Administrator',
    };

    const role = this.authService.currentUser?.role;
    const roleNames: Record<string, string> = {
      '1': 'admin',
      '2': 'teacher',
      '3': 'student',
    };
    const normalizedRole = role === undefined ? undefined : roleNames[String(role).toLowerCase()] ?? String(role).toLowerCase();
    return (normalizedRole && roleLabels[normalizedRole]) ?? 'Ukendt';
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => {
        this.authService.clearSession();
        this.router.navigate(['/login']);
      },
    });
  }
}
