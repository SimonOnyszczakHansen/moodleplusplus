import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Objectives as ObjectivesService } from '../../services/objectives';
import { IObjective } from '../../../../core/models/educationgoal.model';
import { Table, TableAction, TableActionEvent, TableColumn } from '../../../../shared/table/table';
import { Button } from '../../../../shared/button/button';
import { Modal } from '../../../../shared/modal/modal';
import { Input } from '../../../../shared/input/input';

interface ObjectiveRow extends IObjective {
    index: number;
}

@Component({
    selector: 'app-teacher-objectives',
    imports: [Table, Button, Modal, Input],
    templateUrl: './teacher-objectives.html',
    styleUrl: './teacher-objectives.css',
})
export class TeacherObjectives implements OnInit {
    private readonly objectivesService = inject(ObjectivesService);
    private readonly route = inject(ActivatedRoute);

    subjectId = '';
    rows: ObjectiveRow[] = [];

    showCreateObjective = false;
    editingObjectiveId: string | null = null;
    objectiveContent = '';

    readonly columns: TableColumn<ObjectiveRow>[] = [
        { key: 'index', label: '#' },
        { key: 'content', label: 'Målpind' },
    ];
    readonly actions: TableAction[] = [
        { id: 'edit', label: 'Rediger' },
        { id: 'delete', label: 'Slet', variant: 'danger' },
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

    onActionClick(event: TableActionEvent<ObjectiveRow>): void {
        if (event.action === 'edit') this.onEditObjective(event.row);
        if (event.action === 'delete') this.onDeleteObjective(event.row.objectiveId);
    }

    onCreateObjective(): void {
        this.editingObjectiveId = null;
        this.objectiveContent = '';
        this.showCreateObjective = true;
    }

    onEditObjective(row: ObjectiveRow): void {
        this.editingObjectiveId = row.objectiveId;
        this.objectiveContent = row.content;
        this.showCreateObjective = true;
    }

    onCancelCreateObjective(): void {
        this.showCreateObjective = false;
    }

    onSubmitObjective(): void {
        if (!this.objectiveContent || !this.subjectId) return;

        if (this.editingObjectiveId) {
            this.objectivesService.updateObjective(this.editingObjectiveId, { content: this.objectiveContent }).subscribe({
                next: () => {
                    this.loadObjectives();
                    this.showCreateObjective = false;
                },
            });
            return;
        }

        this.objectivesService.createObjective({ subjectId: this.subjectId, content: this.objectiveContent }).subscribe({
            next: () => {
                this.loadObjectives();
                this.showCreateObjective = false;
            },
        });
    }

    onDeleteObjective(objectiveId: string): void {
        this.objectivesService.deleteObjective(objectiveId).subscribe({
            next: () => this.loadObjectives(),
        });
    }
}