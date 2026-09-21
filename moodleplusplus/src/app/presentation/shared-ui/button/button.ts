import { booleanAttribute, Component, input } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class Button {
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly variant = input<'primary' | 'secondary'>('primary');
  readonly disabled = input(false, { transform: booleanAttribute });
}
