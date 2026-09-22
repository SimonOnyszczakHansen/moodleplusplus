import { Component, input } from '@angular/core';

export type StatusVariant = 'ikke afleveret' | 'afleveret' | 'godkendt' | 'afvist';
@Component({
  selector: 'app-status-badge',
  imports: [],
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.css',
})
export class StatusBadge {
	readonly label = input('');
	readonly variant = input<StatusVariant>('ikke afleveret');
}
