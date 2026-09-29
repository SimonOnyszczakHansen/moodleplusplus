import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { Button } from '../../../../shared/button/button';
import { IEditSubjectRequest, ISubject, ISubjectGoal } from '../../models/subjects.model';
import { SubjectsService } from '../../services/subjects';
import { ITask } from '../../../task-page/models/task.model';
import { Modal } from '../../../../shared/modal/modal';
import { Input } from '../../../../shared/input/input';

@Component({
  selector: 'app-subject-overview',
  imports: [CommonModule, Button, Modal, Input],
  templateUrl: './subject-overview.html',
  styleUrl: './subject-overview.css',
})
export class SubjectOverview implements OnInit {
  subject = signal<ISubject | undefined>(undefined);
  goals = signal<ISubjectGoal[]>([]);
  tasks = signal<ITask[]>([]);

  showDeleteSubject = false;
  showEditSubject = false;

  subjectName = '';
  deleteConfirm = '';

  constructor(
    private route: ActivatedRoute,
    private subjectsService: SubjectsService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const subjectId = this.route.snapshot.paramMap.get('id')!;
    this.loadSubjectDetails(subjectId);
  }

  private loadSubjectDetails(subjectId: string): void {
    this.subjectsService.getSubjectById(subjectId).subscribe({
      next: (subject) => this.subject.set(subject),
      error: (err) => console.error('Subject fetch failed:', err),
    });

    this.subjectsService.getGoalsBySubjectId(subjectId).subscribe({
      next: (goals) => this.goals.set(goals),
      error: (err) => console.error('Goals fetch failed:', err),
    });

    this.subjectsService.getTasksBySubjectId(subjectId).subscribe({
      next: (tasks) => this.tasks.set(tasks),
      error: (err) => console.error('Tasks fetch failed:', err),
    });
  }

  get subjectTitle(): string {
    return this.subject()?.name ?? '---';
  }

  get isTeacher(): boolean {
    return this.authService.currentUser?.role === 'teacher';
  }

  viewAllTasks() {
    this.router.navigate(['/tasks']);
  }

  viewAllGoals() {
    this.router.navigate(['/goals']);
  }

  onEditSubject(): void {
    this.subjectName = '';
    this.showEditSubject = true;
  }

  onCancelEditSubject(): void {
    this.showEditSubject = false;
  }

  onSubmitEditSubject(): void {
    if (!this.subjectName.trim()) return;

    const subjectId = this.route.snapshot.paramMap.get('id')!;
    const request: IEditSubjectRequest = {
      name: this.subjectName.trim(),
    };

    this.subjectsService.putSubjectById(subjectId, request).subscribe({
      next: () => {
        this.subjectName = '';
        this.loadSubjectDetails(subjectId);
        this.showEditSubject = false;
      },
      error: (err) => {
        console.error('Update subject failed:', err);
      },
    });
  }

  onDeleteSubject(): void {
    this.deleteConfirm = '';
    this.showDeleteSubject = true;
  }

  onCancelDeleteSubject(): void {
    this.showDeleteSubject = false;
  }

  get isConfirmed(): boolean {
    return this.deleteConfirm.trim() !== 'CONFIRM';
  }

  onSubmitDeleteSubject(): void {
    if (this.deleteConfirm.trim() !== 'CONFIRM') return;

    const subjectId = this.route.snapshot.paramMap.get('id')!;

    this.subjectsService.deleteSubjectById(subjectId).subscribe({
      next: () => this.router.navigate(['/subjects']),
      error: (err) => console.error('Delete subject failed:', err),
    });
  }
}
