import { Component, OnInit } from '@angular/core';
import { StudentContent } from './components/student-content/student-content';
import { TeacherContent } from './components/teacher-content/teacher-content';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [StudentContent, TeacherContent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  userRole?: string;
  userName?: string;

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.userRole = this.auth.currentUser?.role;
    this.userName = this.auth.currentUser?.name;
  }
}
