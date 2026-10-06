import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';

// Services
import { AuthService } from '../../../../core/services/auth.service';
import { TasksService } from '../../../../core/services/tasks/tasks.service';
import { SubjectsService } from '../../../../core/services/subjects/subjects.service';

// Shared Components
import {
  Table,
  TableAction,
  TableActionEvent,
  TableCellTemplate,
  TableColumn,
} from '../../../../shared/table/table';
import { Button } from '../../../../shared/button/button';
import { Modal } from '../../../../shared/modal/modal';
import { Input } from '../../../../shared/input/input';
import { Dropdown, DropdownOption } from '../../../../shared/dropdown/dropdown';

// Models
import { IAssignee } from '../../../../core/models/assignee.model';
import { ISubject } from '../../../../core/models/subjects.model';
import {
  ITask,
  ICreateTaskRequest,
  ITaskAssignmentRow,
  ITaskAssignmentSummary,
} from '../../../../core/models/tasks.model';

interface TaskRow extends ITask {
  index: number;
}

interface AssignmentRow extends ITaskAssignmentSummary {
  index: number;
}

@Component({
  selector: 'app-subject-tasks',
  imports: [CommonModule, Table, TableCellTemplate, DatePipe, Button, Modal, Input, Dropdown],
  templateUrl: './subject-tasks.html',
  styleUrl: './subject-tasks.css',
})
export class SubjectTasks implements OnInit {
  userRole?: string;

  showCreateTask = false;
  editingTaskId: string | null = null;

  showDeleteTask = false;
  deleteConfirm = '';
  pendingDeleteTaskId: string | null = null;

  taskTitle = '';
  taskSubjectId = '';
  taskDescription = '';
  taskDeadline = '';

  studentSearchQuery = '';
  selectedAssignees: IAssignee[] = [];
  existingAssignments = signal<ITaskAssignmentRow[]>([]);

  currentSubject = signal<ISubject | undefined>(undefined);
  subjects = signal<ISubject[]>([]);
  groups = signal<IAssignee[]>([]);
  students = signal<IAssignee[]>([]);

  readonly columns: TableColumn<TaskRow>[] = [
    { key: 'index', label: '#' },
    { key: 'title', label: 'Titel' },
    { key: 'deadline', label: 'Deadline' },
  ];

  readonly studentColumns: TableColumn<AssignmentRow>[] = [
    { key: 'index', label: '#' },
    { key: 'title', label: 'Titel' },
    { key: 'deadline', label: 'Deadline' },
  ];

  rows = signal<TaskRow[]>([]);
  studentRows = signal<AssignmentRow[]>([]);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private subjectsService: SubjectsService,
    private tasksService: TasksService,
  ) {}

  ngOnInit(): void {
    const subjectId = this.route.snapshot.paramMap.get('id')!;
    this.loadSubjectDetails(subjectId);
  }

  private loadSubjectDetails(subjectId: string): void {
    this.subjectsService.getSubjectById(subjectId).subscribe({
      next: (subject) => this.currentSubject.set(subject),
      error: (err) => console.error('Subject fetch failed:', err),
    });

    if (this.isTeacher) {
      this.loadForTeacher(subjectId);
    } else {
      this.loadForStudent(subjectId);
    }
  }

  private loadForTeacher(subjectId: string): void {
    this.subjectsService.getTasksBySubjectId(subjectId).subscribe({
      next: (tasks) => {
        this.rows.set(tasks.map((task, index) => ({ ...task, index: index + 1 })));
      },
      error: (err) => console.error('Tasks fetch failed:', err),
    });

    this.subjectsService.getSubjectsData().subscribe({
      next: (subjects) => this.subjects.set(subjects),
      error: (err) => console.error('Subjects fetch failed:', err),
    });

    this.tasksService.getGroups().subscribe({
      next: (groups) => this.groups.set(groups),
      error: (err) => console.error('Groups fetch failed:', err),
    });

    this.tasksService.getStudents().subscribe({
      next: (students) => this.students.set(students),
      error: (err) => console.error('Students fetch failed:', err),
    });
  }

  private loadForStudent(subjectId: string): void {
    this.tasksService.getMyAssignmentsBySubjectId(subjectId).subscribe({
      next: (assignments) => {
        this.studentRows.set(
          assignments.map((assignment, index) => ({ ...assignment, index: index + 1 })),
        );
      },
      error: (err) => console.error('Assignments fetch failed:', err),
    });
  }

  get subjectTitle(): string {
    return this.currentSubject()?.name ?? '---';
  }

  get isTeacher(): boolean {
    return this.authService.currentUser?.role === 'teacher';
  }

  get actions(): TableAction[] {
    if (this.isTeacher) {
      return [
        { id: 'view', label: 'Se Opgave' },
        { id: 'edit', label: 'Rediger' },
        { id: 'delete', label: 'Slet', variant: 'danger' },
      ];
    } else {
      return [{ id: 'view', label: 'Se Opgave' }];
    }
  }

  get subjectOptions(): DropdownOption[] {
    return this.subjects().map((subject) => ({
      value: subject.id.toString(),
      label: subject.name,
    }));
  }

  onActionClick(event: TableActionEvent<TaskRow>): void {
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

  onStudentActionClick(event: TableActionEvent<AssignmentRow>): void {
    if (event.action === 'view') {
      this.router.navigate(['/tasks', event.row.assignmentId]);
    }
  }

  onCreateTask(): void {
    this.resetCreateTaskForm();
    this.showCreateTask = true;
  }

  onEditTask(row: TaskRow): void {
    this.editingTaskId = row.id;
    this.taskTitle = row.title;
    this.taskSubjectId = row.subjectId;
    this.taskDescription = row.description;
    this.taskDeadline = row.deadline;
    this.studentSearchQuery = '';
    this.selectedAssignees = [];
    this.showCreateTask = true;

    this.tasksService.getTask(row.id).subscribe({
      next: (task) => {
        this.existingAssignments.set(task.assignments);
      },
      error: (err) => console.error('Task detail fetch failed:', err),
    });
  }

  onRemoveExistingAssignment(assignment: ITaskAssignmentRow): void {
    this.tasksService.removeAssignment(assignment.assignmentId).subscribe({
      next: () => {
        this.existingAssignments.update((list) =>
          list.filter((a) => a.assignmentId !== assignment.assignmentId),
        );
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
    this.selectedAssignees = this.selectedAssignees.filter(
      (selected) => selected.id !== assignee.id,
    );
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
      this.tasksService.updateTask(taskId, request).subscribe({
        next: (task) => {
          const { studentIds = [], groupIds = [] } = this.buildAssigneeIds();
          if (studentIds.length || groupIds.length) {
            this.tasksService.assignTask(taskId, studentIds, groupIds).subscribe();
          }

          this.rows.update((rows) =>
            rows.map((row) => (row.id === taskId ? { ...task, index: row.index } : row)),
          );
          this.resetCreateTaskForm();
          this.showCreateTask = false;
        },
      });
      return;
    }

    this.tasksService.createTask(request).subscribe({
      next: (task) => {
        const { studentIds = [], groupIds = [] } = this.buildAssigneeIds();
        if (studentIds.length || groupIds.length) {
          this.tasksService.assignTask(task.id, studentIds, groupIds).subscribe();
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
    this.tasksService.deleteTask(taskId).subscribe({
      next: () => {
        this.rows.update((rows) => rows.filter((row) => row.id !== taskId));
        this.showDeleteTask = false;
        this.pendingDeleteTaskId = null;
      },
    });
  }
}
