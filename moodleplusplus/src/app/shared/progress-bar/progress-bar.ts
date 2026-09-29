import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  imports: [],
  templateUrl: './progress-bar.html',
  styleUrl: './progress-bar.css',
})
export class ProgressBar {
  readonly value = input(0);
  readonly label = input('Progression');

  readonly percentage = computed(() => {
    const value = this.value();
    return Number.isFinite(value) ? Math.round(Math.min(100, Math.max(0, value))) : 0;
  });
}
