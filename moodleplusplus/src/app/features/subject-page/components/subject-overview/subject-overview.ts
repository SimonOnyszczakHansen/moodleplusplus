import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// Services
import { AuthService } from '../../../../core/services/auth.service';
import { SubjectsService } from '../../../../core/services/subjects/subjects.service';

// Shared
import { Button } from '../../../../shared/button/button';
import { Modal } from '../../../../shared/modal/modal';
import { Input } from '../../../../shared/input/input';
import { BackButton } from '../../../../shared/back-button/back-button';

// Models
import {
  IEditSubjectRequest,
  ISubject,
  ISubjectGoal,
  ISubjectTeacher,
} from '../../../../core/models/subjects.model';
import { ITask } from '../../../../core/models/tasks.model';
import { User } from '../../../../core/models/user.interface';
import { TasksService } from '../../../../core/services/tasks/tasks.service';

@Component({
  selector: 'app-subject-overview',
  imports: [CommonModule, Button, Modal, Input, BackButton],
  templateUrl: './subject-overview.html',
  styleUrl: './subject-overview.css',
})
export class SubjectOverview implements OnInit {
  private readonly taskLimit = 2;
  private readonly goalLimit = 10;
  private readonly studentLimit = 5;

  subject = signal<ISubject | undefined>(undefined);
  teacher = signal<ISubjectTeacher | undefined>(undefined);
  goals = signal<ISubjectGoal[]>([]);
  tasks = signal<ITask[]>([]);
  students = signal<User[]>([]);

  showDeleteSubject = false;
  showEditSubject = false;

  subjectName = '';
  deleteConfirm = '';

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
      next: (subject) => this.subject.set(subject),
      error: (err) => console.error('Subject fetch failed:', err),
    });

    this.subjectsService.getTeacherBySubjectId(subjectId).subscribe({
      next: (teacher) => this.teacher.set(teacher),
      error: (err) => console.error('Teacher fetch failed:', err),
    });

    this.subjectsService.getGoalsBySubjectId(subjectId).subscribe({
      next: (goals) => this.goals.set(goals),
      error: (err) => console.error('Goals fetch failed:', err),
    });

    this.tasksService.getTasksBySubjectId(subjectId).subscribe({
      next: (tasks) => this.tasks.set(tasks),
      error: (err) => console.error('Tasks fetch failed:', err),
    });

    this.subjectsService.getStudentsBySubjectId(subjectId).subscribe({
      next: (students) => this.students.set(students),
      error: (err) => console.error('Students fetch failed:', err),
    });
  }

  get subjectTitle(): string {
    return this.subject()?.name ?? '---';
  }

  get teacherName(): string {
    return this.teacher()?.name ?? this.teacher()?.Name ?? 'Ukendt underviser';
  }

  get teacherEmail(): string {
    return this.teacher()?.email ?? this.teacher()?.Email ?? '';
  }

  get isTeacher(): boolean {
    return this.authService.currentUser?.role === 'teacher';
  }

  get isStudent(): boolean {
    return this.authService.currentUser?.role === 'student';
  }

  taskItems(): ITask[] {
    return this.tasks().slice(0, this.taskLimit);
  }

  goalItems(): ISubjectGoal[] {
    return this.goals().slice(0, this.goalLimit);
  }

  studentItems(): User[] {
    return this.students().slice(0, this.studentLimit);
  }

  taskCountText(): string {
    const total = this.tasks().length;
    return total > this.taskLimit ? `Viser ${this.taskItems().length} af ${total} opgaver` : '';
  }

  goalCountText(): string {
    const total = this.goals().length;
    return total > this.goalLimit ? `Viser ${this.goalItems().length} af ${total} mål` : '';
  }

  studentCountText(): string {
    const total = this.students().length;
    return total > this.studentLimit
      ? `Viser ${this.studentItems().length} af ${total} elever`
      : '';
  }

  viewSubjectTasks() {
    const subjectId = this.route.snapshot.paramMap.get('id')!;
    this.router.navigate([`/subject/${subjectId}/tasks`]);
  }

  viewStudentProgression(): void {
    const subjectId = this.route.snapshot.paramMap.get('id')!;
    const studentId = this.authService.currentUser?.id;

    if (!studentId) return;

    this.router.navigate([`/progress/students/${studentId}/subjects/${subjectId}`]);
  }

  viewSubjectGoals() {
    const subjectId = this.route.snapshot.paramMap.get('id')!;
    this.router.navigate([`/subject/${subjectId}/goals`]);
  }

  viewSubjectStudents() {
    const subjectId = this.route.snapshot.paramMap.get('id')!;
    this.router.navigate([`/subject/${subjectId}/students`]);
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
