import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Table } from './table';

describe('Table', () => {
  let component: Table;
  let fixture: ComponentFixture<Table>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Table]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Table<Record<string, unknown>>);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders configured columns in order and preserves zero values', async () => {
    fixture.componentRef.setInput('caption', 'Students');
    fixture.componentRef.setInput('columns', [
      { key: 'name', label: 'Name' },
      { key: 'score', label: 'Score' },
    ]);
    fixture.componentRef.setInput('rows', [{ name: 'Alex', score: 0, privateNote: 'Hidden' }]);
    await fixture.whenStable();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('caption')?.textContent).toBe('Students');
    expect(Array.from(element.querySelectorAll('th'), cell => cell.textContent?.trim()))
      .toEqual(['Name', 'Score']);
    expect(Array.from(element.querySelectorAll('tbody td'), cell => cell.textContent?.trim()))
      .toEqual(['Alex', '0']);
    expect(element.textContent).not.toContain('Hidden');
  });

  it('shows an empty message spanning data and action columns', async () => {
    fixture.componentRef.setInput('columns', [{ key: 'name', label: 'Name' }]);
    fixture.componentRef.setInput('actions', [{ id: 'edit', label: 'Edit' }]);
    fixture.componentRef.setInput('emptyMessage', 'No students yet.');
    await fixture.whenStable();

    const cell: HTMLTableCellElement = fixture.nativeElement.querySelector('tbody td');
    expect(cell.textContent?.trim()).toBe('No students yet.');
    expect(cell.colSpan).toBe(2);
    expect(fixture.nativeElement.querySelector('app-button')).toBeNull();
  });

  it('emits the chosen action with the correct row', async () => {
    const firstRow = { name: 'Alex' };
    const secondRow = { name: 'Sam' };
    const received: unknown[] = [];
    component.actionClick.subscribe(event => received.push(event));
    fixture.componentRef.setInput('columns', [{ key: 'name', label: 'Name' }]);
    fixture.componentRef.setInput('rows', [firstRow, secondRow]);
    fixture.componentRef.setInput('actions', [{ id: 'edit', label: 'Edit' }]);
    await fixture.whenStable();

    fixture.nativeElement.querySelectorAll('button')[1].click();
    expect(received).toEqual([{ action: 'edit', row: secondRow }]);
  });
});
