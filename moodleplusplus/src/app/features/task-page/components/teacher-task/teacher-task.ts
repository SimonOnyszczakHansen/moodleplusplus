import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { TasksService as TaskService } from '../../../../core/services/tasks/tasks.service';
import { SubjectsService } from '../../../../core/services/subjects/subjects.service';
import { ITask, ICreateTaskRequest, ITaskAssignmentRow } from '../../../../core/models/tasks.model';
import { Table, TableAction, TableActionEvent, TableCellTemplate, TableColumn } from '../../../../shared/table/table';
import { Button } from '../../../../shared/button/button';
import { Modal } from '../../../../shared/modal/modal';
import { Input } from '../../../../shared/input/input';
import { Dropdown, DropdownOption } from '../../../../shared/dropdown/dropdown';
import { IAssignee } from '../../../../core/models/assignee.model';
import { ISubject } from '../../../../core/models/subjects.model';


interface TeacherTaskRow extends ITask {
	index: number;
}

@Component({
  selector: 'app-teacher-task',
  imports: [CommonModule, Table, TableCellTemplate, DatePipe, Button, Modal, Input, Dropdown],
  templateUrl: './teacher-task.html',
  styleUrl: './teacher-task.css',
})
export class TeacherTask implements OnInit {
	private readonly taskService = inject(TaskService);
	private readonly subjectsService = inject(SubjectsService);
	private readonly router = inject(Router);
	showCreateTask = false;
	editingTaskId: string | null = null;

	showDeleteTask = false;
	deleteConfirm = '';
	pendingDeleteTaskId: string | null = null;

	taskFormError = signal<string | null>(null);

	taskTitle = '';
	taskSubjectId = '';
	taskDescription = '';
	taskDeadline = '';

	studentSearchQuery = '';
	selectedAssignees: IAssignee[] = [];
	existingAssignments = signal<ITaskAssignmentRow[]>([]);

	subjects = signal<ISubject[]>([]);
	groups = signal<IAssignee[]>([]);
	students = signal<IAssignee[]>([]);

	readonly columns: TableColumn<TeacherTaskRow>[] = [
		{ key: 'index', label: '#' },
		{ key: 'title', label: 'Titel' },
		{ key: 'deadline', label: 'Deadline' },
	];
	readonly actions: TableAction[] = [{ id: 'view', label: 'Se Opgave' }, { id: 'edit', label: 'Rediger' }, { id: 'delete', label: 'Slet', variant: 'danger' }];

	rows = signal<TeacherTaskRow[]>([]);

	get subjectOptions(): DropdownOption[] {
		return this.subjects().map((subject) => ({ value: String(subject.id), label: subject.name }));
	}

	ngOnInit(): void {
		this.taskService.getTasks().subscribe({
			next: (tasks) => {
				this.rows.set(tasks.map((task, index) => ({ ...task, index: index + 1 })));
			},
			error: (err) => console.error('Tasks fetch failed:', err),
		});

		this.subjectsService.getSubjectsData().subscribe({
			next: (subjects) => { this.subjects.set(subjects); },
			error: (err) => console.error('Subjects fetch failed:', err),
		});

		this.taskService.getGroups().subscribe({
			next: (groups) => { this.groups.set(groups); },
			error: (err) => console.error('Groups fetch failed:', err),
		});

		this.taskService.getStudents().subscribe({
			next: (students) => { this.students.set(students); },
			error: (err) => console.error('Students fetch failed:', err),
		});
	}

	onActionClick(event: TableActionEvent<TeacherTaskRow>): void {
		if (event.action === 'view') {
			this.router.navigate(['/tasks', event.row.id]);
		}
		if (event.action === 'edit') {
			this.onEditTask(event.row);
		}
		if (event.action === 'delete') {
			this.onDeleteTask(event.row.id);
		}
	}

	onCreateTask(): void {
		this.resetCreateTaskForm();
		this.taskFormError.set(null);
		this.showCreateTask = true;
	}

	onEditTask(row: TeacherTaskRow): void {
		this.editingTaskId = row.id;
		this.taskTitle = row.title;
		this.taskSubjectId = row.subjectId;
		this.taskDescription = row.description;
		this.taskDeadline = row.deadline;
		this.studentSearchQuery = '';
		this.selectedAssignees = [];
		this.taskFormError.set(null);
		this.showCreateTask = true;

		this.taskService.getTask(row.id).subscribe({
			next: (task) => { this.existingAssignments.set(task.assignments); },
			error: (err) => console.error('Task detail fetch failed:', err),
		});
	}

	onRemoveExistingAssignment(assignment: ITaskAssignmentRow): void {
		this.taskService.removeAssignment(assignment.assignmentId).subscribe({
			next: () => {
				this.existingAssignments.update((list) => list.filter((a) => a.assignmentId !== assignment.assignmentId));
			},
		});
	}

	onCancelCreateTask(): void {
		this.showCreateTask = false;
		this.resetCreateTaskForm();
	}

	get filteredAssignees(): IAssignee[] {
		const query = this.studentSearchQuery.trim().toLowerCase();
		if (!query) return [];

		return [...this.students(), ...this.groups()].filter(
			(assignee) =>
				assignee.name.toLowerCase().includes(query) &&
				!this.selectedAssignees.some((selected) => selected.id === assignee.id),
		);
	}

	onAddAssignee(assignee: IAssignee): void {
		this.selectedAssignees = [...this.selectedAssignees, assignee];
		this.studentSearchQuery = '';
	}

	onRemoveAssignee(assignee: IAssignee): void {
		this.selectedAssignees = this.selectedAssignees.filter((selected) => selected.id !== assignee.id);
	}

	private buildAssigneeIds(): { studentIds: string[]; groupIds: string[] } {
		return {
			studentIds: this.selectedAssignees.filter((a) => a.type === 'student').map((a) => a.id),
			groupIds: this.selectedAssignees.filter((a) => a.type === 'group').map((a) => a.id),
		};
	}

	onSubmitTask(): void {
		if (!this.taskTitle.trim() || !this.taskSubjectId || !this.taskDeadline.trim() || !this.taskDescription.trim()) {
			this.taskFormError.set('Udfyld venligst titel, fag, deadline og beskrivelse.');
			return;
		}
		this.taskFormError.set(null);

		const request: ICreateTaskRequest = {
			subjectId: this.taskSubjectId,
			title: this.taskTitle,
			description: this.taskDescription || undefined,
			deadline: this.taskDeadline || undefined,
		};

		if (this.editingTaskId) {
			const taskId = this.editingTaskId;
			this.taskService.updateTask(taskId, request).subscribe({
				next: (task) => {
					const { studentIds = [], groupIds = [] } = this.buildAssigneeIds();
					if (studentIds.length || groupIds.length) {
						this.taskService.assignTask(taskId, studentIds, groupIds).subscribe();
					}

					this.rows.update((rows) => rows.map((row) => (row.id === taskId ? { ...task, index: row.index } : row)));
					this.resetCreateTaskForm();
					this.showCreateTask = false;
				},
			});
			return;
		}

		this.taskService.createTask(request).subscribe({
			next: (task) => {
				const { studentIds = [], groupIds = [] } = this.buildAssigneeIds();
				if (studentIds.length || groupIds.length) {
					this.taskService.assignTask(task.id, studentIds, groupIds).subscribe();
				}

				this.rows.update((rows) => [...rows, { ...task, index: rows.length + 1 }]);
				this.resetCreateTaskForm();
				this.showCreateTask = false;
			},
		});
	}

	private resetCreateTaskForm(): void {
		this.editingTaskId = null;
		this.taskTitle = '';
		this.taskSubjectId = '';
		this.taskDescription = '';
		this.taskDeadline = '';
		this.studentSearchQuery = '';
		this.selectedAssignees = [];
		this.existingAssignments.set([]);
	}

	onDeleteTask(taskId: string): void {
		this.pendingDeleteTaskId = taskId;
		this.deleteConfirm = '';
		this.showDeleteTask = true;
	}

	onCancelDeleteTask(): void {
		this.showDeleteTask = false;
		this.pendingDeleteTaskId = null;
	}

	get isConfirmed(): boolean {
		return this.deleteConfirm.trim() !== 'CONFIRM';
	}

	onSubmitDeleteTask(): void {
		if (this.deleteConfirm.trim() !== 'CONFIRM' || !this.pendingDeleteTaskId) return;

		const taskId = this.pendingDeleteTaskId;
		this.taskService.deleteTask(taskId).subscribe({
			next: () => {
				this.rows.update((rows) => rows.filter((row) => row.id !== taskId));
				this.showDeleteTask = false;
				this.pendingDeleteTaskId = null;
			},
		});
	}
}
