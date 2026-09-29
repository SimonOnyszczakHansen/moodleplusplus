import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Task as TaskService } from '../../services/task';
import { ITask, ICreateTaskRequest, ITaskAssignmentRow } from '../../models/task.model';
import { Table, TableAction, TableActionEvent, TableCellTemplate, TableColumn } from '../../../../shared/table/table';
import { Button } from '../../../../shared/button/button';
import { Modal } from '../../../../shared/modal/modal';
import { Input } from '../../../../shared/input/input';
import { Dropdown, DropdownOption } from '../../../../shared/dropdown/dropdown';
import { IAssignee } from '../../models/assignee.model';
import { ISubject } from '../../models/subject.model';


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
	private readonly router = inject(Router);
	showCreateTask = false;
	editingTaskId: string | null = null;

	taskTitle = '';
	taskSubjectId = '';
	taskDescription = '';
	taskDeadline = '';

	studentSearchQuery = '';
	selectedAssignees: IAssignee[] = [];
	existingAssignments: ITaskAssignmentRow[] = [];

	subjects: ISubject[] = [];
	groups: IAssignee[] = [];
	students: IAssignee[] = [];

	readonly columns: TableColumn<TeacherTaskRow>[] = [
		{ key: 'index', label: '#' },
		{ key: 'title', label: 'Titel' },
		{ key: 'deadline', label: 'Deadline' },
	];
	readonly actions: TableAction[] = [{ id: 'view', label: 'Se Opgave' }, { id: 'edit', label: 'Rediger' }, { id: 'delete', label: 'Slet', variant: 'danger' }];

	rows: TeacherTaskRow[] = [];

	get subjectOptions(): DropdownOption[] {
		return this.subjects.map((subject) => ({ value: subject.id, label: subject.name }));
	}

	ngOnInit(): void {
		this.taskService.getTasks().subscribe({
			next: (tasks) => {
				this.rows = tasks.map((task, index) => ({ ...task, index: index + 1 }));
			}
		});

		this.taskService.getSubjects().subscribe({
			next: (subjects) => { this.subjects = subjects; },
		});

		this.taskService.getGroups().subscribe({
			next: (groups) => { this.groups = groups; },
		});

		this.taskService.getStudents().subscribe({
			next: (students) => { this.students = students; },
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
		this.showCreateTask = true;

		this.taskService.getTask(row.id).subscribe({
			next: (task) => { this.existingAssignments = task.assignments; },
		});
	}

	onRemoveExistingAssignment(assignment: ITaskAssignmentRow): void {
		this.taskService.removeAssignment(assignment.assignmentId).subscribe({
			next: () => {
				this.existingAssignments = this.existingAssignments.filter((a) => a.assignmentId !== assignment.assignmentId);
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

		return [...this.students, ...this.groups].filter(
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
		if (!this.taskTitle || !this.taskSubjectId) return;

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

					this.rows = this.rows.map((row) => (row.id === taskId ? { ...task, index: row.index } : row));
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

				this.rows = [...this.rows, { ...task, index: this.rows.length + 1 }];
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
		this.existingAssignments = [];
	}

	onDeleteTask(taskId: string): void {
		this.taskService.deleteTask(taskId).subscribe({
			next: () => {
				this.rows = this.rows.filter((row) => row.id !== taskId);
			},
		});
	}
}
