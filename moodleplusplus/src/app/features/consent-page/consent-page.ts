import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from '../../shared/button/button';
import { Consent } from './services/consent';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
	selector: 'app-consent-page',
	imports: [CommonModule, Button],
	templateUrl: './consent-page.html',
	styleUrl: './consent-page.css',
})
export class ConsentPage {
	tosAccepted = false;

	constructor(private consentService: Consent, private router: Router, private authService: AuthService) { }

	private get email(): string {
		return this.authService.currentUser?.email ?? '';
	}

	onAcceptTOS() {
		this.tosAccepted = true;
	}

	onAcceptPP() {
		this.consentService
			.submitConsent({ email: this.email, privacyPolicyAccepted: true, termsOfServiceAccepted: true })
			.subscribe({
				next: () => {
					this.authService.markConsentAccepted();
					this.router.navigate(['/dashboard']);
				},
				error: (err) => console.error('Consent submission failed', err),
			});
	}

	onDecline() {
		this.router.navigate(['/login']);
	}
}