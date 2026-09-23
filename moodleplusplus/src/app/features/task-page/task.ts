import { Component } from '@angular/core';
import { StudentTask } from './components/student-task/student-task';

@Component({
  selector: 'app-task',
  imports: [StudentTask],
  templateUrl: './task.html',
  styleUrl: './task.css',
})
export class Task {
	userRole = "student"
}
