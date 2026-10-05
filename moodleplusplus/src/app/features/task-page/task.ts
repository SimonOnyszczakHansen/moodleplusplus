import { Component, inject } from '@angular/core';
import { StudentTask } from './components/student-task/student-task';
import { TeacherTask } from './components/teacher-task/teacher-task';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-task',
  imports: [StudentTask, TeacherTask],
  templateUrl: './task.html',
  styleUrl: './task.css',
})
export class Task {
  private readonly authService = inject(AuthService);
  userRole = this.authService.currentUser?.role;
}
