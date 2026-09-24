import { Component, OnInit } from '@angular/core';
import { StudentSubjects } from './components/student-subjects/student-subjects';
import { TeacherSubjects } from './components/teacher-subjects/teacher-subjects';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-subject-page',
  imports: [StudentSubjects, TeacherSubjects],
  templateUrl: './subject-page.html',
  styleUrl: './subject-page.css',
})
export class SubjectPage implements OnInit {
  userRole?: string;

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.userRole = this.auth.currentUser?.role;
  }
}
