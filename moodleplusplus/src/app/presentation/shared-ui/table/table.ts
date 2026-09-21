import { Component, input, output } from '@angular/core';
import { Button } from '../button/button';

export interface TableColumn<T> {
  key: keyof T;
  label: string;
}

export interface TableAction {
  id: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface TableActionEvent<T> {
  action: string;
  row: T;
}

@Component({
  selector: 'app-table',
  imports: [Button],
  templateUrl: './table.html',
  styleUrl: './table.css',
})
export class Table<T extends object = Record<string, unknown>> {
  readonly columns = input<readonly TableColumn<T>[]>([]);
  readonly rows = input<readonly T[]>([]);
  readonly actions = input<readonly TableAction[]>([]);
  readonly emptyMessage = input('No data to display.');
  readonly actionClick = output<TableActionEvent<T>>();
}
