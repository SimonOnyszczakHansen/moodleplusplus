import { Component } from '@angular/core';
import { TasksList } from './components/tasks-list/tasks-list';

@Component({
  selector: 'app-task',
  imports: [TasksList],
  templateUrl: './task.html',
  styleUrl: './task.css',
})
export class Task {}
