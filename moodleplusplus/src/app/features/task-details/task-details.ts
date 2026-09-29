import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { TeacherTaskDetails } from './components/teacher-task-details/teacher-task-details';
import { StudentTaskDetails } from './components/student-task-details/student-task-details';

@Component({
  selector: 'app-task-details',
  imports: [TeacherTaskDetails, StudentTaskDetails],
  templateUrl: './task-details.html',
  styleUrl: './task-details.css',
})
export class TaskDetails {
    private readonly authService = inject(AuthService);

    userRole = this.authService.currentUser?.role;
}
