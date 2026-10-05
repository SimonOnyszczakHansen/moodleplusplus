import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatInputModule, MatButtonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm!: FormGroup;
  readonly errorMessage = signal<string | null>(null);
  readonly isLoggingIn = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit() {
    if (this.isLoggingIn()) return;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.isLoggingIn.set(true);

    this.authService.login(this.loginForm.value).pipe(
      finalize(() => this.isLoggingIn.set(false)),
    ).subscribe({
      next: () => {
        const home = this.authService.isAdmin ? '/admin/users' : '/dashboard';
        const destination = this.authService.hasAcceptedConsent ? home : '/consent';
        this.router.navigate([destination]);
      },
      error: (err: { status: number; error?: { message?: string } }) => {
        if (err.status === 401) {
          this.errorMessage.set('Forkert email eller kodeord.');
          return;
        }

        this.errorMessage.set(err.error?.message || 'Der opstod en serverfejl.');
      },
    });
  }
}
