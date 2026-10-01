import { Component, Directive, TemplateRef, contentChildren, input, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Button } from '../button/button';

export interface TableColumn<T> {
  key: keyof T;
  label: string;
}

// Marks an <ng-template appTableCell="key"> as the custom renderer for that column.
@Directive({
  selector: 'ng-template[appTableCell]',
})
export class TableCellTemplate<T = unknown> {
  readonly appTableCell = input.required<string>();

  constructor(readonly templateRef: TemplateRef<{ $implicit: T }>) {}
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
  imports: [Button, NgTemplateOutlet],
  templateUrl: './table.html',
  styleUrl: './table.css',
})
export class Table<T extends object = Record<string, unknown>> {
  readonly columns = input<readonly TableColumn<T>[]>([]);
  readonly rows = input<readonly T[]>([]);
  readonly actions = input<readonly TableAction[]>([]);
  readonly emptyMessage = input('Ingen data at vise.');
  readonly actionClick = output<TableActionEvent<T>>();

  // Custom per-column cell content, projected via <ng-template appTableCell="key">.
  readonly cellTemplates = contentChildren(TableCellTemplate);

  templateFor(key: keyof T) {
    return this.cellTemplates().find(template => template.appTableCell() === String(key))?.templateRef;
  }
}
