import { Component, input } from '@angular/core';

export type StatusVariant = 'Ikke afleveret' | 'Afleveret' | 'Godkendt' | 'Ikke godkendt';
@Component({
  selector: 'app-status-badge',
  imports: [],
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.css',
})
export class StatusBadge {
	readonly label = input('');
	readonly variant = input<StatusVariant>('Ikke afleveret');
}
