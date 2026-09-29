import { booleanAttribute, Component, input, model } from '@angular/core';

export interface DropdownOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-dropdown',
  imports: [],
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.css',
})
export class Dropdown {
  readonly label = input('');
  readonly options = input<DropdownOption[]>([]);
  readonly placeholder = input('');
  readonly name = input('');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly value = model('');
}