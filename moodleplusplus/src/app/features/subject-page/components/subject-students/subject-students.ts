import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';

// Services
import { AuthService } from '../../../../core/services/auth.service';
import { SubjectsService } from '../../../../core/services/subjects/subjects.service';

// Shared Components
import { Table, TableAction, TableActionEvent, TableColumn } from '../../../../shared/table/table';
import { BackButton } from '../../../../shared/back-button/back-button';

// Models
import { ISubject } from '../../../../core/models/subjects.model';
import { User } from '../../../../core/models/user.interface';

interface Row extends User {
  index: number;
}

@Component({
  selector: 'app-subject-students',
  imports: [CommonModule, Table, BackButton],
  templateUrl: './subject-students.html',
  styleUrl: './subject-students.css',
})
export class SubjectStudents implements OnInit {
  userRole?: string;

  currentSubject = signal<ISubject | undefined>(undefined);
  rows = signal<Row[]>([]);

  readonly columns: TableColumn<Row>[] = [
    { key: 'index', label: '#' },
    { key: 'name', label: 'Navn' },
    { key: 'email', label: 'E-Mail' },
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private subjectsService: SubjectsService,
  ) {}

  ngOnInit(): void {
    const subjectId = this.route.snapshot.paramMap.get('id')!;
    this.loadData(subjectId);
  }

  private loadData(subjectId: string): void {
    this.subjectsService.getSubjectById(subjectId).subscribe({
      next: (subject) => this.currentSubject.set(subject),
      error: (err) => console.error('Subject fetch failed:', err),
    });

    this.subjectsService.getStudentsBySubjectId(subjectId).subscribe({
      next: (students) => {
        this.rows.set(students.map((student, index) => ({ ...student, index: index + 1 })));
      },
      error: (err) => console.error('Students fetch failed:', err),
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
      return [{ id: 'view', label: 'Se Progression' }];
    } else {
      return [];
    }
  }

  onActionClick(event: TableActionEvent<Row>): void {
    // Update in cleanup
    if (event.action === 'view') {
      const subjectId = this.route.snapshot.paramMap.get('id')!;
      this.router.navigate([`progress/students/${event.row.id}/subjects/${subjectId}`]);
    }
  }
}
