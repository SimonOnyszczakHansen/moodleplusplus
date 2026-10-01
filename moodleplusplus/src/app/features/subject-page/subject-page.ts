import { Component, OnInit } from '@angular/core';
import { SubjectList } from './components/subject-list/subject-list';
import { AuthService } from '../../core/services/auth.service';
import { Button } from '../../shared/button/button';
import { ICreateSubjectRequest } from './models/subjects.model';
import { SubjectsService } from './services/subjects';
import { Modal } from '../../shared/modal/modal';
import { Input } from '../../shared/input/input';
import { Router } from '@angular/router';

@Component({
  selector: 'app-subject-page',
  imports: [SubjectList, Button, Modal, Input],
  templateUrl: './subject-page.html',
  styleUrl: './subject-page.css',
})
export class SubjectPage implements OnInit {
  userRole?: string;
  showCreateSubject = false;

  subjectName = '';

  constructor(
    private auth: AuthService,
    private subjectsService: SubjectsService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const role = this.auth.currentUser?.role;
    const roleNames: Record<string, string> = {
      '1': 'administrator',
      '2': 'teacher',
      '3': 'student',
    };
    this.userRole =
      role === undefined
        ? undefined
        : (roleNames[String(role).toLowerCase()] ?? String(role).toLowerCase());
  }

  onCreateSubject(): void {
    this.resetCreateSubjectForm();
    this.showCreateSubject = true;
  }

  private resetCreateSubjectForm(): void {
    this.subjectName = '';
  }

  onCancelCreateSubject(): void {
    this.showCreateSubject = false;
    this.resetCreateSubjectForm();
  }

  onSubmitSubject(): void {
    if (!this.subjectName) return;

    const request: ICreateSubjectRequest = {
      name: this.subjectName,
    };

    this.subjectsService.createSubject(request).subscribe();
    this.resetCreateSubjectForm();
    this.showCreateSubject = false;
  }
}
