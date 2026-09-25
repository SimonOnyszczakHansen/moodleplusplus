import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IObjective } from '../../../../core/models/educationgoal.model';
import { Objectives as ObjectivesService } from '../../../objectives/services/objectives';
import { DatePipe } from '@angular/common';
import { Task as TaskService } from '../../../task-page/services/task';
import { ICreateTaskRequest, ITaskAssignmentRow, ITeacherTaskDetail, TaskStatus } from '../../../task-page/models/task.model';
import { ISubject } from '../../../task-page/models/subject.model';
import { IAssignee } from '../../../task-page/models/assignee.model';
import { Button } from '../../../../shared/button/button';
import { StatusBadge } from '../../../../shared/status-badge/status-badge';
import { Table, TableCellTemplate, TableColumn } from '../../../../shared/table/table';
import { Modal } from '../../../../shared/modal/modal';
import { Input } from '../../../../shared/input/input';
import { Dropdown, DropdownOption } from '../../../../shared/dropdown/dropdown';

// Flattened roster row for the shared Table component - feedback is a dummy key, only used to place the buttons column.
interface RosterRow {
    name: string;
    submittedAt: string | null;
    status: TaskStatus;
    fileName: string | null;
    feedback: null;
}

@Component({
	selector: 'app-teacher-task-details',
	imports: [DatePipe, Button, StatusBadge, Table, TableCellTemplate, Modal, Input, Dropdown],
	templateUrl: './teacher-task-details.html',
	styleUrl: './teacher-task-details.css',
})
export class TeacherTaskDetails implements OnInit {
    teacherTask: ITeacherTaskDetail | null = null;

	viewHistoryVisible = false;
	feedbackVisible = false;
	addObjectiveVisible = false;
	updateVisible = false;

	taskEditModel: ICreateTaskRequest = { subjectId: '', title: '', description: '', deadline: '' };
	subjects: ISubject[] = [];
	groups: IAssignee[] = [];
	students: IAssignee[] = [];
	objectives: IObjective[] = [];
	selectedObjectiveIds: string[] = [];

	studentSearchQuery = '';
	selectedAssignees: IAssignee[] = [];
	existingAssignments: ITaskAssignmentRow[] = [];

    readonly rosterColumns: TableColumn<RosterRow>[] = [
        { key: 'name', label: 'Elever' },
        { key: 'submittedAt', label: 'Afleveringsdato' },
        { key: 'status', label: 'Status' },
        { key: 'fileName', label: 'Aflevering' },
        { key: 'feedback', label: 'Feedback' },
    ];

    constructor(private route: ActivatedRoute, private taskService: TaskService, private objectivesService: ObjectivesService) {}

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id') ?? '';
        this.taskService.getTask(id).subscribe({
            next: (task) => { this.teacherTask = task; },
            error: () => { this.teacherTask = null; },
        });

        this.taskService.getSubjects().subscribe({ next: (subjects) => { this.subjects = subjects; } });
        this.taskService.getGroups().subscribe({ next: (groups) => { this.groups = groups; } });
        this.taskService.getStudents().subscribe({ next: (students) => { this.students = students; } });
    }

    get subjectOptions(): DropdownOption[] {
        return this.subjects.map((subject) => ({ value: subject.id, label: subject.name }));
    }

    get filteredAssignees(): IAssignee[] {
        const query = this.studentSearchQuery.trim().toLowerCase();
        if (!query) return [];

        return [...this.students, ...this.groups].filter(
            (assignee) =>
                assignee.name.toLowerCase().includes(query) &&
                !this.selectedAssignees.some((selected) => selected.id === assignee.id),
        );
    }

    get rosterRows(): RosterRow[] {
        if (!this.teacherTask) return [];

        return this.teacherTask.assignments.map((row) => ({
            name: row.studentName ?? row.groupName ?? '—',
            submittedAt: row.submission?.submittedAt ?? null,
            status: row.status,
            fileName: row.submission?.file?.fileName ?? null,
            feedback: null,
        }));
    }

	onViewHistory(): void {
		this.viewHistoryVisible = true;
	}

	onViewFeedback(): void {
		this.feedbackVisible = true;
	}

	onViewAddObjective(): void {
		if (!this.teacherTask) return;

		const attachedIds = new Set(this.teacherTask.objectives.map((o) => o.objectiveId));

		this.objectivesService.getObjectivesBySubject(this.teacherTask.subjectId).subscribe({
			next: (objectives) => {
				this.objectives = objectives.filter((o) => !attachedIds.has(o.objectiveId));
			},
		});

		this.selectedObjectiveIds = [];
		this.addObjectiveVisible = true;
	}

	isObjectiveSelected(objectiveId: string): boolean {
		return this.selectedObjectiveIds.includes(objectiveId);
	}

	onToggleObjective(objectiveId: string): void {
		this.selectedObjectiveIds = this.isObjectiveSelected(objectiveId)
			? this.selectedObjectiveIds.filter((id) => id !== objectiveId)
			: [...this.selectedObjectiveIds, objectiveId];
	}

	onViewUpdate(): void {
		if (!this.teacherTask) return;

		this.taskEditModel = {
			subjectId: this.teacherTask.subjectId,
			title: this.teacherTask.title,
			description: this.teacherTask.description,
			deadline: this.teacherTask.deadline,
		};
		this.existingAssignments = this.teacherTask.assignments;
		this.studentSearchQuery = '';
		this.selectedAssignees = [];
		this.updateVisible = true;
	}

	onAddAssignee(assignee: IAssignee): void {
		this.selectedAssignees = [...this.selectedAssignees, assignee];
		this.studentSearchQuery = '';
	}

	onRemoveAssignee(assignee: IAssignee): void {
		this.selectedAssignees = this.selectedAssignees.filter((selected) => selected.id !== assignee.id);
	}

	onRemoveExistingAssignment(assignment: ITaskAssignmentRow): void {
		this.taskService.removeAssignment(assignment.assignmentId).subscribe({
			next: () => {
				this.existingAssignments = this.existingAssignments.filter((a) => a.assignmentId !== assignment.assignmentId);
			},
		});
	}

	onSubmitUpdate(): void {
		if (!this.teacherTask) return;
		const taskId = this.teacherTask.id;

		this.taskService.updateTask(taskId, this.taskEditModel).subscribe({
			next: (task) => {
				if (!this.teacherTask) return;
				this.teacherTask = { ...this.teacherTask, ...task };

				const students = this.selectedAssignees.filter((a) => a.type === 'student');
				const groups = this.selectedAssignees.filter((a) => a.type === 'group');

				if (!students.length && !groups.length) {
					this.updateVisible = false;
					return;
				}

				const studentIds = students.map((a) => a.id);
				const groupIds = groups.map((a) => a.id);

				this.taskService.assignTask(taskId, studentIds, groupIds).subscribe({
					next: (assignments) => {
						if (!this.teacherTask) return;

						const orderedAssignees = [...students, ...groups];
						const newRows: ITaskAssignmentRow[] = assignments.map((assignment, index) => ({
							assignmentId: assignment.assignmentId,
							studentId: orderedAssignees[index]?.type === 'student' ? orderedAssignees[index].id : undefined,
							studentName: orderedAssignees[index]?.type === 'student' ? orderedAssignees[index].name : undefined,
							groupId: assignment.groupId,
							groupName: assignment.groupName,
							status: assignment.status,
							submission: null,
							feedback: [],
						}));

						this.teacherTask = { ...this.teacherTask, assignments: [...this.existingAssignments, ...newRows] };
						this.updateVisible = false;
					},
				});
			},
		});
	}
	onSubmitAddObjective(): void {
		if (!this.teacherTask) return;

		const newObjectives = this.objectives.filter((o) => this.selectedObjectiveIds.includes(o.objectiveId));
		const allObjectiveIds = [...this.teacherTask.objectives.map((o) => o.objectiveId), ...this.selectedObjectiveIds];

		this.taskService.linkTaskGoals(this.teacherTask.id, allObjectiveIds).subscribe({
			next: () => {
				if (!this.teacherTask) return;
				this.teacherTask = { ...this.teacherTask, objectives: [...this.teacherTask.objectives, ...newObjectives] };
				this.addObjectiveVisible = false;
			},
		});
	}

	onSubmitFeedback(): void {
		
	}

}
