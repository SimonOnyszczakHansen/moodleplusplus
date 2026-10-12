import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Services
import { Objectives as ObjectivesService } from '../../../objectives/services/objectives';
import { TasksService } from '../../../../core/services/tasks/tasks.service';

// Shared
import { Button } from '../../../../shared/button/button';
import { StatusBadge } from '../../../../shared/status-badge/status-badge';
import { Table, TableCellTemplate, TableColumn } from '../../../../shared/table/table';
import { Modal } from '../../../../shared/modal/modal';
import { Input } from '../../../../shared/input/input';
import { Dropdown, DropdownOption } from '../../../../shared/dropdown/dropdown';
import { ActionMenu } from '../../../../shared/action-menu/action-menu';
import { BackButton } from '../../../../shared/back-button/back-button';

// Models
import { IObjective } from '../../../../core/models/educationgoal.model';
import {
  ICreateTaskRequest,
  ITaskAssignmentRow,
  ITeacherTaskDetail,
  ReviewStatus,
  TaskStatus,
} from '../../../../core/models/tasks.model';
import { ISubject } from '../../../../core/models/subjects.model';
import { IAssignee } from '../../../../core/models/assignee.model';
import { SubjectsService } from '../../../../core/services/subjects/subjects.service';

// Flattened roster row for the shared Table component - feedback is a dummy key, only used to place the buttons column.
interface RosterRow {
  assignmentId: string;
  studentId?: string;
  name: string;
  submittedAt: string | null;
  status: TaskStatus;
  fileName: string | null;
  comment: string | null;
  feedback: null;
}

@Component({
  selector: 'app-teacher-task-details',
  imports: [
    DatePipe,
    FormsModule,
    Button,
    StatusBadge,
    Table,
    TableCellTemplate,
    Modal,
    Input,
    Dropdown,
    ActionMenu,
    BackButton,
  ],
  templateUrl: './teacher-task-details.html',
  styleUrl: './teacher-task-details.css',
})
export class TeacherTaskDetails implements OnInit {
  teacherTask = signal<ITeacherTaskDetail | null>(null);

  feedbackVisible = false;
  addObjectiveVisible = false;
  updateVisible = false;

  // description/deadline are always real strings here (populated from ITask), unlike the create-flow's optional fields.
  taskEditModel: Required<ICreateTaskRequest> = {
    subjectId: '',
    title: '',
    description: '',
    deadline: '',
  };
  subjects = signal<ISubject[]>([]);
  groups = signal<IAssignee[]>([]);
  students = signal<IAssignee[]>([]);
  objectives = signal<IObjective[]>([]);
  reviewingAssignmentId = signal<string | null>(null);
  reviewError = signal<string | null>(null);
  downloadingAssignmentId = signal<string | null>(null);
  selectedObjectiveIds: string[] = [];
  objectivesLoading = signal(false);
  objectivesLoaded = signal(false);
  objectivesSaving = signal(false);
  objectiveError = signal<string | null>(null);
  selectedRosterRow = signal<RosterRow | null>(null);
  feedbackError = signal<string | null>(null);
  readonly reviewStatusOptions: DropdownOption[] = [
    { value: 'Godkendt', label: 'Godkend' },
    { value: 'Afvist', label: 'Afvis' },
  ];
  selectedReviewStatus = '';

  studentSearchQuery = '';
  selectedAssignees: IAssignee[] = [];
  existingAssignments = signal<ITaskAssignmentRow[]>([]);

  feedbackText = '';

  readonly rosterColumns: TableColumn<RosterRow>[] = [
    { key: 'name', label: 'Elever' },
    { key: 'submittedAt', label: 'Afleveringsdato' },
    { key: 'status', label: 'Status' },
    { key: 'fileName', label: 'Aflevering' },
    { key: 'comment', label: 'Kommentar' },
    { key: 'feedback', label: '  ' },
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private tasksService: TasksService,
    private subjectsServive: SubjectsService,
    private objectivesService: ObjectivesService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.tasksService.getTask(id).subscribe({
      next: (task) => {
        this.teacherTask.set(task);
        this.loadSubmissions(task.assignments);
      },
      error: () => {
        this.teacherTask.set(null);
      },
    });

    this.subjectsServive.getMySubjects().subscribe({
      next: (subjects) => this.subjects.set(subjects),
    });

    this.tasksService.getGroups().subscribe({
      next: (groups) => {
        this.groups.set(groups);
      },
    });
    this.tasksService.getStudents().subscribe({
      next: (students) => {
        this.students.set(students);
      },
    });
  }

  // /tasks/{id} doesn't embed submissions - fetch each non-empty assignment's submission separately.
  private loadSubmissions(assignments: ITaskAssignmentRow[]): void {
    const submitted = assignments.filter((a) => a.status !== 'Ikke afleveret');
    if (!submitted.length) return;

    const requests = submitted.map((assignment) =>
      this.tasksService.getSubmission(assignment.assignmentId).pipe(
        map((submission) => ({ assignmentId: assignment.assignmentId, submission })),
        catchError(() => of({ assignmentId: assignment.assignmentId, submission: null })),
      ),
    );

    forkJoin(requests).subscribe((results) => {
      const current = this.teacherTask();
      if (!current) return;

      const submissionByAssignmentId = new Map(results.map((r) => [r.assignmentId, r.submission]));
      this.teacherTask.set({
        ...current,
        assignments: current.assignments.map((a) => ({
          ...a,
          submission: submissionByAssignmentId.get(a.assignmentId) ?? a.submission,
        })),
      });
    });
  }

  get subjectOptions(): DropdownOption[] {
    return this.subjects().map((subject) => ({
      value: subject.id.toString(),
      label: subject.name,
    }));
  }

  isLikelyUrl(value: string): boolean {
    return /^https?:\/\//i.test(value.trim());
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

  get rosterRows(): RosterRow[] {
    const teacherTask = this.teacherTask();
    if (!teacherTask) return [];

    return teacherTask.assignments.map((row) => ({
      assignmentId: row.assignmentId,
      studentId: row.studentId,
      name: row.studentName ?? row.groupName ?? '—',
      submittedAt: row.submission?.submittedAt ?? null,
      status: row.status,
      fileName: row.submission?.file?.fileName ?? null,
      comment: row.submission?.comment ?? null,
      feedback: null,
    }));
  }

  onViewHistory(row: RosterRow): void {
    const teacherTask = this.teacherTask();
    if (!teacherTask) return;

    this.router.navigate(['/tasks', teacherTask.id, 'assignments', row.assignmentId, 'history'], {
      queryParams: {
        name: row.name,
        studentId: row.studentId ?? null,
        returnTo: `/tasks/${teacherTask.id}`,
      },
    });
  }

  onViewFeedback(): void {
    this.feedbackVisible = true;
  }

  onViewAddObjective(): void {
    const teacherTask = this.teacherTask();
    if (!teacherTask) return;

    this.selectedObjectiveIds = teacherTask.objectives.map((o) => o.objectiveId);
    this.objectives.set([]);
    this.objectiveError.set(null);
    this.objectivesLoaded.set(false);
    this.objectivesLoading.set(true);
    this.addObjectiveVisible = true;

    this.objectivesService.getObjectivesBySubject(teacherTask.subjectId).subscribe({
      next: (objectives) => {
        this.objectives.set(objectives);
        this.objectivesLoaded.set(true);
        this.objectivesLoading.set(false);
      },
      error: () => {
        this.objectivesLoading.set(false);
        this.objectiveError.set('Kunne ikke hente målpinde. Prøv igen.');
      },
    });
  }

  isObjectiveSelected(objectiveId: string): boolean {
    return this.selectedObjectiveIds.includes(objectiveId);
  }

  onToggleObjective(objectiveId: string): void {
    if (!this.objectivesLoaded() || this.objectivesSaving()) return;
    this.selectedObjectiveIds = this.isObjectiveSelected(objectiveId)
      ? this.selectedObjectiveIds.filter((id) => id !== objectiveId)
      : [...this.selectedObjectiveIds, objectiveId];
  }

  onViewUpdate(): void {
    const teacherTask = this.teacherTask();
    if (!teacherTask) return;

    this.taskEditModel = {
      subjectId: teacherTask.subjectId,
      title: teacherTask.title,
      description: teacherTask.description,
      deadline: teacherTask.deadline,
    };
    this.existingAssignments.set(teacherTask.assignments);
    this.studentSearchQuery = '';
    this.selectedAssignees = [];
    this.updateVisible = true;
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

  onRemoveExistingAssignment(assignment: ITaskAssignmentRow): void {
    this.tasksService.removeAssignment(assignment.assignmentId).subscribe({
      next: () => {
        this.existingAssignments.update((assignments) =>
          assignments.filter((a) => a.assignmentId !== assignment.assignmentId),
        );
      },
    });
  }

  onSubmitUpdate(): void {
    const teacherTask = this.teacherTask();
    if (!teacherTask) return;
    const taskId = teacherTask.id;

    this.tasksService.updateTask(taskId, this.taskEditModel).subscribe({
      next: (task) => {
        const current = this.teacherTask();
        if (!current) return;
        this.teacherTask.set({ ...current, ...task });

        const students = this.selectedAssignees.filter((a) => a.type === 'student');
        const groups = this.selectedAssignees.filter((a) => a.type === 'group');

        if (!students.length && !groups.length) {
          this.updateVisible = false;
          return;
        }

        const studentIds = students.map((a) => a.id);
        const groupIds = groups.map((a) => a.id);

        this.tasksService.assignTask(taskId, studentIds, groupIds).subscribe({
          next: (assignments) => {
            const current = this.teacherTask();
            if (!current) return;

            const orderedAssignees = [...students, ...groups];
            const newRows: ITaskAssignmentRow[] = assignments.map((assignment, index) => ({
              assignmentId: assignment.assignmentId,
              studentId:
                orderedAssignees[index]?.type === 'student'
                  ? orderedAssignees[index].id
                  : undefined,
              studentName:
                orderedAssignees[index]?.type === 'student'
                  ? orderedAssignees[index].name
                  : undefined,
              groupId: assignment.groupId,
              groupName: assignment.groupName,
              status: assignment.status,
              submission: null,
              feedback: [],
            }));

            this.teacherTask.set({
              ...current,
              assignments: [...this.existingAssignments(), ...newRows],
            });
            this.updateVisible = false;
          },
        });
      },
    });
  }
  onSubmitAddObjective(): void {
    const teacherTask = this.teacherTask();
    if (!teacherTask || !this.objectivesLoaded() || this.objectivesSaving()) return;

    const selectedObjectives = this.objectives().filter((o) =>
      this.selectedObjectiveIds.includes(o.objectiveId),
    );
    const objectiveIds = selectedObjectives.map((o) => o.objectiveId);
    this.objectiveError.set(null);
    this.objectivesSaving.set(true);

    this.tasksService.linkTaskGoals(teacherTask.id, objectiveIds).subscribe({
      next: () => {
        this.objectivesSaving.set(false);
        const current = this.teacherTask();
        if (!current) return;
        this.teacherTask.set({ ...current, objectives: selectedObjectives });
        this.addObjectiveVisible = false;
      },
      error: () => {
        this.objectivesSaving.set(false);
        this.objectiveError.set('Kunne ikke gemme målpinde. Prøv igen.');
      },
    });
  }

  onApproveSubmission(row: RosterRow): void {
    this.onReviewSubmission(row, 'Godkendt');
  }

  onRejectSubmission(row: RosterRow): void {
    this.onReviewSubmission(row, 'Afvist');
  }

  onReviewSubmission(row: RosterRow, status: ReviewStatus): void {
    this.reviewError.set(null);
    this.reviewingAssignmentId.set(row.assignmentId);

    this.tasksService.reviewSubmission(row.assignmentId, status).subscribe({
      next: () => {
        this.reviewingAssignmentId.set(null);
        const current = this.teacherTask();
        if (!current) return;

        this.teacherTask.set({
          ...current,
          assignments: current.assignments.map((assignment) =>
            assignment.assignmentId === row.assignmentId ? { ...assignment, status } : assignment,
          ),
        });
      },
      error: () => {
        this.reviewingAssignmentId.set(null);
        this.reviewError.set('Kunne ikke opdatere status. Prøv igen.');
      },
    });
  }

  onGiveFeedback(row: RosterRow): void {
    this.selectedRosterRow.set(row);
    this.feedbackText = '';
    this.selectedReviewStatus = '';
    this.feedbackError.set(null);
    this.feedbackVisible = true;
  }

  onSubmitFeedback(): void {
    const teacherTask = this.teacherTask();
    const row = this.selectedRosterRow();
    if (!teacherTask || !row || !row.studentId || !this.feedbackText.trim()) return;

    this.feedbackError.set(null);
    this.tasksService
      .addFeedback(row.studentId, teacherTask.id, this.feedbackText, row.assignmentId)
      .subscribe({
        next: () => {
          const status = this.selectedReviewStatus as ReviewStatus | '';
          if (status) {
            this.onReviewSubmission(row, status);
          }
          this.feedbackVisible = false;
          this.feedbackText = '';
          this.selectedReviewStatus = '';
          this.selectedRosterRow.set(null);
        },
        error: () => {
          this.feedbackError.set('Kunne ikke sende feedback. Prøv igen.');
        },
      });
  }

    onDownloadFile(row: RosterRow): void {
    if (!row.fileName) return;

    this.downloadingAssignmentId.set(row.assignmentId);
    this.tasksService.downloadSubmissionFile(row.assignmentId).subscribe({
      next: (blob) => {
        this.downloadingAssignmentId.set(null);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = row.fileName!;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      },
      error: () => this.downloadingAssignmentId.set(null),
    });
  }
}
