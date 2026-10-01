import { Component, input } from '@angular/core';

export type StatusVariantTask = 'Ikke afleveret' | 'Afleveret' | 'Godkendt' | 'Ikke godkendt';
export type StatusVariantQuiz = 'Tilgængelig' | 'Bestået' | 'Fejlet';
export type StatusVariant = StatusVariantTask | StatusVariantQuiz;

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