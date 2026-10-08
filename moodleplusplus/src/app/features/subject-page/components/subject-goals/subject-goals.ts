import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Services
import { AuthService } from '../../../../core/services/auth.service';
import { SubjectsService } from '../../../../core/services/subjects/subjects.service';

// Shared
import { Table, TableAction, TableActionEvent, TableColumn } from '../../../../shared/table/table';
import { Button } from '../../../../shared/button/button';
import { Modal } from '../../../../shared/modal/modal';
import { Input } from '../../../../shared/input/input';
import { BackButton } from '../../../../shared/back-button/back-button';

// Models
import {
  ICreateGoalRequest,
  IEditGoalRequest,
  ISubject,
  ISubjectGoal,
  ISubjectGoalRow,
} from '../../../../core/models/subjects.model';

@Component({
  selector: 'app-subject-goals',
  imports: [Button, Modal, Input, Table, BackButton],
  templateUrl: './subject-goals.html',
  styleUrl: './subject-goals.css',
})
export class SubjectGoals implements OnInit {
  currentSubject = signal<ISubject | undefined>(undefined);
  goals = signal<ISubjectGoal[]>([]);

  showCreateGoal = false;
  showDeleteGoal = false;

  goalId: string | null = null;
  formContent = '';
  goalDraft = '';
  goalEntries: string[] = [];
  deleteConfirm = '';

  readonly columns: TableColumn<ISubjectGoalRow>[] = [
    { key: 'index', label: '#' },
    { key: 'content', label: 'Målpind' },
  ];

  rows = signal<ISubjectGoalRow[]>([]);

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private subjectsService: SubjectsService,
  ) {}

  ngOnInit(): void {
    const subjectId = this.route.snapshot.paramMap.get('id')!;
    this.loadSubject(subjectId);
    this.loadSubjectGoals(subjectId);
    this.subjectsService.refresh$.subscribe(() => this.loadSubjectGoals(subjectId));
  }

  private loadSubject(subjectId: string): void {
    this.subjectsService.getSubjectById(subjectId).subscribe({
      next: (subject) => this.currentSubject.set(subject),
      error: (err) => console.error('Subject fetch failed:', err),
    });
  }

  private loadSubjectGoals(subjectId: string): void {
    this.subjectsService.getGoalsBySubjectId(subjectId).subscribe({
      next: (goals) => {
        this.rows.set(goals.map((goal, index) => ({ ...goal, index: index + 1 })));
      },
      error: (err) => console.error('Goals fetch failed:', err),
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
        { id: 'edit', label: 'Rediger' },
        { id: 'delete', label: 'Slet', variant: 'danger' },
      ];
    }
    return [];
  }

  get isConfirmed(): boolean {
    return this.deleteConfirm.trim() !== 'CONFIRM';
  }

  onActionClick(event: TableActionEvent<ISubjectGoalRow>): void {
    if (event.action === 'edit') {
      this.onEditGoal(event.row);
    }
    if (event.action === 'delete') {
      this.onDeleteGoal(event.row.id.toString());
    }
  }

  onCreateGoal(): void {
    this.goalId = null;
    this.formContent = '';
    this.goalDraft = '';
    this.goalEntries = [];
    this.showCreateGoal = true;
  }

  addGoalToList(): void {
    const content = this.goalDraft.trim();
    if (!content) return;

    this.goalEntries.push(content);
    this.goalDraft = '';
  }

  removeGoalFromList(index: number): void {
    this.goalEntries.splice(index, 1);
  }

  onEditGoal(row: ISubjectGoalRow): void {
    this.goalId = row.id.toString();
    this.formContent = row.content;
    this.showCreateGoal = true;
  }

  onDeleteGoal(goalId: string): void {
    this.goalId = goalId;
    this.deleteConfirm = '';
    this.showDeleteGoal = true;
  }

  onCancelGoal(): void {
    this.goalDraft = '';
    this.goalEntries = [];
    this.showCreateGoal = false;
    this.showDeleteGoal = false;
  }

  onSubmitGoal(): void {
    if (this.goalId) {
      if (!this.formContent.trim()) return;

      const editRequest: IEditGoalRequest = {
        content: this.formContent.trim(),
      };
      this.subjectsService.editGoalById(this.goalId, editRequest).subscribe({
        next: () => (this.showCreateGoal = false),
        error: (err) => console.error('Edit goal failed:', err),
      });
      return;
    }

    if (this.goalEntries.length === 0) return;

    const subjectId = this.route.snapshot.paramMap.get('id')!;
    const requests: ICreateGoalRequest[] = this.goalEntries.map((content) => ({
      subjectId,
      content,
    }));

    this.subjectsService.createGoals(requests).subscribe({
      next: () => {
        this.goalEntries = [];
        this.goalDraft = '';
        this.showCreateGoal = false;
      },
      error: (err) => console.error('Create goals failed:', err),
    });
  }

  onSubmitDeleteGoal(): void {
    if (this.deleteConfirm.trim() !== 'CONFIRM' || !this.goalId) return;

    this.subjectsService.deleteGoalById(this.goalId).subscribe({
      next: () => (this.showDeleteGoal = false),
      error: (err) => console.error('Delete goal failed:', err),
    });
  }
}
