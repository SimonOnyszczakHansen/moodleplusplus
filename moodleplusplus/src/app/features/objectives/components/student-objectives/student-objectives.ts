import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Objectives as ObjectivesService } from '../../services/objectives';
import { IObjective } from '../../../../core/models/educationgoal.model';
import { Table, TableColumn } from '../../../../shared/table/table';
import { BackButton } from '../../../../shared/back-button/back-button';

interface ObjectiveRow extends IObjective {
	index: number;
}

@Component({
	selector: 'app-student-objectives',
	imports: [Table, BackButton],
	templateUrl: './student-objectives.html',
	styleUrl: './student-objectives.css',
})
export class StudentObjectives implements OnInit {
	private readonly objectivesService = inject(ObjectivesService);
	private readonly route = inject(ActivatedRoute);

	subjectId = '';
	rows: ObjectiveRow[] = [];

	readonly columns: TableColumn<ObjectiveRow>[] = [
		{ key: 'index', label: '#' },
		{ key: 'content', label: 'Målpind' },
	];

	ngOnInit(): void {
		this.subjectId = this.route.snapshot.paramMap.get('subjectId') ?? '';
		this.loadObjectives();
	}

	private loadObjectives(): void {
		if (!this.subjectId) return;

		this.objectivesService.getObjectivesBySubject(this.subjectId).subscribe({
			next: (objectives) => {
				this.rows = objectives.map((objective, index) => ({ ...objective, index: index + 1 }));
			},
		});
	}
}
