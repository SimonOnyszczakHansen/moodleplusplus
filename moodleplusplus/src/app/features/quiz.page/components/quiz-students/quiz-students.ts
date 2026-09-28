import { Component, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { Modal } from '../../../../shared/modal/modal';
import { User } from '../../../../core/models/user.interface';
import { QuizStudentResponse } from '../../models/responses';
import { QuizService } from '../../services/quiz';

interface AttachedStudent {
	studentId: string;
	name: string;
	email: string;
	attached: boolean;
	status: string | null;
	completedAt: string | null;
	scorePercentage: number | null;
}

@Component({
	selector: 'app-quiz-students',
	imports: [FormsModule, Modal, RouterLink],
	templateUrl: './quiz-students.html',
	styleUrl: './quiz-students.css',
})
export class QuizStudents {
	readonly quizId = input.required<string>();
	readonly quizTitle = input.required<string>();
	readonly quizService: QuizService;

	readonly isOpen = signal(false);
	readonly students = signal<AttachedStudent[] | null>(null);
	readonly searchTerm = signal('');
	readonly errorMessage = signal<string | null>(null);
	readonly updatingStudentIds = signal<Set<string>>(new Set());

	constructor(quizService: QuizService) {
		this.quizService = quizService;
	}

	open(): void {
		this.isOpen.set(true);
		this.students.set(null);
		this.errorMessage.set(null);
		forkJoin({
			attached: this.quizService.getQuizStudents(this.quizId()),
			users: this.quizService.getUsers(),
		}).subscribe({
			next: ({ attached, users }) => this.students.set(this.mapStudents(attached, users)),
			error: () => this.errorMessage.set('Eleverne kunne ikke hentes.'),
		});
	}

	updateStudent(student: AttachedStudent): void {
		if (this.updatingStudentIds().has(student.studentId)) {
			return;
		}

		this.updatingStudentIds.update((ids) => new Set(ids).add(student.studentId));
		const request = student.attached
			? this.quizService.removeStudent(this.quizId(), student.studentId)
			: this.quizService.addStudent(this.quizId(), { studentId: student.studentId });

		request.pipe(finalize(() => {
			this.updatingStudentIds.update((ids) => {
				const updated = new Set(ids);
				updated.delete(student.studentId);
				return updated;
			});
		})).subscribe({
			next: () => {
				this.students.update((students) => students?.map((item) =>
					item.studentId === student.studentId ? { ...item, attached: !item.attached } : item,
				) ?? null);
				this.errorMessage.set(null);
			},
			error: () => this.errorMessage.set('Ændringen kunne ikke gemmes.'),
		});
	}

	get filteredStudents(): AttachedStudent[] {
		const search = this.searchTerm().trim().toLowerCase();
		return (this.students() ?? []).filter((student) =>
			student.name.toLowerCase().includes(search) || student.email.toLowerCase().includes(search),
		);
	}

	statusLabel(student: AttachedStudent): string {
		if (!student.attached) {
			return 'Ikke tilføjet';
		}

		const status = student.status?.toLowerCase();
		if (status === 'passed') {
			return 'Gennemført - Bestået';
		}
		if (status === 'failed') {
			return 'Gennemført - Ikke bestået';
		}
		return 'Afventer besvarelse';
	}

	private mapStudents(attached: QuizStudentResponse[], users: User[]): AttachedStudent[] {
		const assignmentsByStudentId = new Map(attached.map((student) => [student.studentId, student]));
		return users
			.filter((user) => String(user.role).toLowerCase() === '3' || String(user.role).toLowerCase() === 'student')
			.filter((user): user is User & { id: string | number } => user.id !== null && user.id !== undefined)
			.map((user) => {
				const studentId = String(user.id);
				const assignment = assignmentsByStudentId.get(studentId);
				return {
					studentId,
					name: user.name,
					email: user.email ?? '',
					attached: Boolean(assignment),
					status: assignment?.status ?? null,
					completedAt: assignment?.completedAt ?? null,
					scorePercentage: assignment?.scorePercentage ?? null,
				};
			});
	}
}