import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom, forkJoin } from 'rxjs';
import { Modal } from '../../shared/modal/modal';
import { GroupDetails, GroupStudent } from './models/group.model';
import { GroupsService } from './services/groups';

@Component({
  selector: 'app-groups-page',
  imports: [FormsModule, Modal],
  templateUrl: './groups-page.html',
  styleUrl: './groups-page.css',
})
export class GroupsPage implements OnInit {
  private readonly service = inject(GroupsService);
  readonly groups = signal<GroupDetails[]>([]);
  readonly students = signal<GroupStudent[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly pageError = signal('');
  readonly formError = signal('');
  readonly success = signal('');
  readonly editorOpen = signal(false);
  readonly deletingGroup = signal<GroupDetails | null>(null);
  readonly deleteError = signal('');
  readonly editingId = signal<string | null>(null);
  readonly name = signal('');
  readonly search = signal('');
  readonly selectedStudents = signal<Pick<GroupStudent, 'id' | 'name' | 'email'>[]>([]);
  readonly selectedStudentIds = computed(() => new Set(this.selectedStudents().map((student) => student.id)));
  readonly studentEmails = computed(() => new Map(this.students().map((student) => [student.id, student.email])));
  readonly filteredStudents = computed(() => {
    const query = this.search().trim().toLocaleLowerCase();
    return this.students().filter((student) =>
      `${student.name} ${student.email}`.toLocaleLowerCase().includes(query));
  });

  constructor() {
    effect((onCleanup) => {
      if (!this.success()) return;

      const timer = setTimeout(() => this.success.set(''), 4000);
      onCleanup(() => clearTimeout(timer));
    });
  }

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.pageError.set('');
    try {
      const data = await firstValueFrom(forkJoin({
        groups: this.service.getGroups(), students: this.service.getStudents(),
      }));
      this.groups.set(data.groups);
      this.students.set(data.students);
    } catch {
      this.pageError.set('Grupper og elever kunne ikke hentes. Prøv igen.');
    } finally {
      this.loading.set(false);
    }
  }

  openEditor(group?: GroupDetails): void {
    this.editingId.set(group?.id ?? null);
    this.name.set(group?.name ?? '');
    this.selectedStudents.set(group?.students.map((student) => ({
      ...student, email: this.studentEmails().get(student.id) ?? '',
    })) ?? []);
    this.search.set('');
    this.formError.set('');
    this.success.set('');
    this.editorOpen.set(true);
  }

  addStudent(student: GroupStudent): void {
    if (this.saving() || this.selectedStudents().some((selected) => selected.id === student.id)) return;
    this.selectedStudents.update((students) => [...students, student]);
  }

  toggleStudent(student: GroupStudent): void {
    if (this.selectedStudentIds().has(student.id)) {
      this.removeStudent(student.id);
    } else {
      this.addStudent(student);
    }
  }

  removeStudent(id: string): void {
    if (!this.saving()) this.selectedStudents.update((students) => students.filter((student) => student.id !== id));
  }

  async save(): Promise<void> {
    if (this.saving()) return;
    const name = this.name().trim();
    if (!name || name.length > 200) {
      this.formError.set('Gruppenavnet skal indeholde mellem 1 og 200 tegn.');
      return;
    }
    this.saving.set(true);
    this.formError.set('');
    let changed = false;
    try {
      let id = this.editingId();
      let current: GroupDetails;
      if (id) {
        // Read current membership again so retrying a partial save does not add duplicates.
        current = await firstValueFrom(this.service.getGroup(id));
      } else {
        const created = await firstValueFrom(this.service.createGroup(name));
        id = created.id;
        this.editingId.set(id);
        current = { ...created, students: [] };
        changed = true;
        this.upsertGroup(current);
      }
      if (current.name !== name) {
        const renamed = await firstValueFrom(this.service.renameGroup(id, name));
        current = { ...current, ...renamed };
        changed = true;
        this.upsertGroup(current);
      }
      const desiredIds = this.selectedStudents().map((student) => student.id);
      const currentIds = current.students.map((student) => student.id);
      const added = desiredIds.filter((studentId) => !currentIds.includes(studentId));
      const removed = currentIds.filter((studentId) => !desiredIds.includes(studentId));
      if (added.length) {
        await firstValueFrom(this.service.addMembers(id, added));
        changed = true;
      }
      if (removed.length) {
        await firstValueFrom(this.service.removeMembers(id, removed));
        changed = true;
      }
      this.upsertGroup(await firstValueFrom(this.service.getGroup(id)));
      this.editorOpen.set(false);
      this.success.set('Gruppen er gemt.');
    } catch (error) {
      const message = error instanceof HttpErrorResponse && error.status === 409
        ? 'Gruppenavnet er allerede i brug, eller en elev er allerede medlem.'
        : 'Gruppen kunne ikke gemmes. Prøv igen.';
      this.formError.set(changed
        ? `${message} Nogle ændringer er gemt. Du kan prøve igen for at gemme resten.`
        : message);
      // Keep the cards honest if one of the separate API writes failed.
      if (this.editingId()) {
        try {
          this.upsertGroup(await firstValueFrom(this.service.getGroup(this.editingId()!)));
        } catch {
          this.pageError.set('Gruppens aktuelle medlemmer kunne ikke hentes. Genindlæs listen.');
        }
      }
    } finally {
      this.saving.set(false);
    }
  }

  requestDelete(group: GroupDetails): void {
    this.deleteError.set('');
    this.success.set('');
    this.deletingGroup.set(group);
  }

  async deleteGroup(): Promise<void> {
    const group = this.deletingGroup();
    if (!group || this.saving()) return;
    this.saving.set(true);
    this.deleteError.set('');
    try {
      await firstValueFrom(this.service.deleteGroup(group.id));
      this.groups.update((groups) => groups.filter((entry) => entry.id !== group.id));
      this.deletingGroup.set(null);
      this.success.set('Gruppen er slettet.');
    } catch {
      this.deleteError.set('Gruppen kunne ikke slettes. Prøv igen.');
    } finally {
      this.saving.set(false);
    }
  }

  private upsertGroup(group: GroupDetails): void {
    this.groups.update((groups) => groups.some((entry) => entry.id === group.id)
      ? groups.map((entry) => entry.id === group.id ? group : entry)
      : [...groups, group]);
  }
}
