import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Task as TaskService } from '../../services/task';
import { ITaskAssignmentSummary } from '../../models/task.model';
import { Table, TableAction, TableActionEvent, TableCellTemplate, TableColumn } from '../../../../shared/table/table';
import { StatusBadge } from '../../../../shared/status-badge/status-badge';

interface StudentTaskRow extends ITaskAssignmentSummary {
	index: number;
}

@Component({
	selector: 'app-student-task',
	imports: [Table, TableCellTemplate, StatusBadge, DatePipe],
	templateUrl: './student-task.html',
	styleUrl: './student-task.css',
})
export class StudentTask implements OnInit {
	private readonly taskService = inject(TaskService);
	private readonly router = inject(Router);

	readonly columns: TableColumn<StudentTaskRow>[] = [
		{ key: 'index', label: '#' },
		{ key: 'title', label: 'Titel' },
		{ key: 'deadline', label: 'Deadline' },
		{ key: 'status', label: 'Status' },
	];
	readonly actions: TableAction[] = [{ id: 'view', label: 'Se Opgave' }];

	rows = signal<StudentTaskRow[]>([]);

	ngOnInit(): void {
		this.taskService.getMyAssignments().subscribe({
			next: (assignments) => {
				this.rows.set(assignments.map((assignment, index) => ({ ...assignment, index: index + 1 })));
			},
			error: (err) => console.error('Assignments fetch failed:', err),
		});
	}

	onActionClick(event: TableActionEvent<StudentTaskRow>): void {
		if (event.action === 'view') {
			this.router.navigate(['/tasks', event.row.assignmentId]);
		}
	}
}