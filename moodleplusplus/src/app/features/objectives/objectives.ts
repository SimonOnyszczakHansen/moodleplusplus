import { Component, inject } from '@angular/core';
import { StudentObjectives } from './components/student-objectives/student-objectives';
import { TeacherObjectives } from './components/teacher-objectives/teacher-objectives';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-objectives',
    imports: [StudentObjectives, TeacherObjectives],
    templateUrl: './objectives.html',
    styleUrl: './objectives.css',
})
export class Objectives {
	private readonly authService = inject(AuthService);
	userRole = this.authService.currentUser?.role;
}