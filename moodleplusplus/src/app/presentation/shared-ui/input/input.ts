import { booleanAttribute, Component, input, model } from '@angular/core';

@Component({
  selector: 'app-input',
  imports: [],
  templateUrl: './input.html',
  styleUrl: './input.css',
})
export class Input {
  readonly label = input('');
  readonly type = input<'text' | 'email' | 'password' | 'search' | 'tel' | 'url'>('text');
  readonly placeholder = input('');
  readonly name = input('');
  readonly autocomplete = input('off');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly value = model('');
}
