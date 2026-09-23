import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-consent',
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule],
  templateUrl: './consent.html',
  styleUrl: './consent.css',
})
export class Consent {
  accepted = false;
  errorMessage: string | null = null;
  isSubmitting = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  submitConsent(): void {
    if (!this.accepted) {
      this.errorMessage = 'Du skal acceptere samtykket for at fortsætte.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    this.authService
      .acceptConsent({
        type: 'privacy',
        version: '1.0',
        accepted: true,
      })
      .subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          this.errorMessage = 'Samtykket kunne ikke gemmes. Prøv igen.';
          this.isSubmitting = false;
        },
      });
  }
}
