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

  get currentUserRole(): string {
    return this.authService.currentUser?.role ?? 'Unknown';
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
