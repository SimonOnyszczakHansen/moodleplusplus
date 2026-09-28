import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { Button } from '../../shared/button/button';
import { Modal } from '../../shared/modal/modal';
import { Table, TableAction, TableActionEvent, TableCellTemplate, TableColumn } from '../../shared/table/table';
import { AdminUser } from './models/admin-user';
import { AdminUsersService } from './services/admin-users';

@Component({
  selector: 'app-admin-page',
  imports: [ReactiveFormsModule, Button, Modal, Table, TableCellTemplate],
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.css',
})
export class AdminPage implements OnInit {
  private readonly service = inject(AdminUsersService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  readonly users = signal<AdminUser[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly loadError = signal('');
  readonly actionError = signal('');
  readonly successMessage = signal('');
  readonly editorOpen = signal(false);
  readonly deleteOpen = signal(false);
  readonly editingUser = signal<AdminUser | null>(null);
  readonly deletingUser = signal<AdminUser | null>(null);

  readonly columns: TableColumn<AdminUser>[] = [
    { key: 'name', label: 'Navn' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Rolle' },
  ];
  readonly actions: TableAction[] = [
    { id: 'edit', label: 'Rediger', variant: 'secondary' },
    { id: 'delete', label: 'Slet', variant: 'danger' },
  ];
  readonly roles = [
    { value: 3, label: 'Elev' },
    { value: 2, label: 'Underviser' },
    { value: 1, label: 'Administrator' },
  ];
  readonly userForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.pattern(/\S/)]],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    role: [3, [Validators.required]],
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.loadError.set('');
    this.service.getUsers().pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.loading.set(false)),
    ).subscribe({
      next: (users) => this.users.set(users),
      error: (error: HttpErrorResponse) => this.loadError.set(
        this.errorMessage(error, 'Brugerne kunne ikke hentes. Prøv igen.'),
      ),
    });
  }

  openCreate(): void {
    if (this.saving()) return;
    this.editingUser.set(null);
    this.clearMessages();
    this.userForm.reset({ name: '', email: '', password: '', role: 3 });
    this.userForm.controls.password.setValidators([Validators.required]);
    this.userForm.controls.password.updateValueAndValidity();
    this.editorOpen.set(true);
  }

  onAction(event: TableActionEvent<AdminUser>): void {
    if (this.saving()) return;
    this.clearMessages();
    if (event.action === 'delete') {
      this.deletingUser.set(event.row);
      this.deleteOpen.set(true);
    } else if (event.action === 'edit') {
      this.editingUser.set(event.row);
      this.userForm.reset({ name: event.row.name, email: event.row.email, password: '', role: 3 });
      this.userForm.controls.password.clearValidators();
      this.userForm.controls.password.updateValueAndValidity();
      this.editorOpen.set(true);
    }
  }

  saveUser(): void {
    if (this.saving()) return;
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }
    const value = this.userForm.getRawValue();
    const request = { name: value.name.trim(), email: value.email.trim() };
    const user = this.editingUser();
    const operation: Observable<AdminUser | void> = user
      ? this.service.updateUser(user.id, request)
      : this.service.createUser({ ...request, password: value.password, role: value.role });

    this.saving.set(true);
    this.actionError.set('');
    operation.pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.saving.set(false)),
    ).subscribe({
      next: () => {
        this.editorOpen.set(false);
        this.userForm.controls.password.reset();
        this.successMessage.set(user ? 'Brugeren er opdateret.' : 'Brugeren er oprettet.');
        this.loadUsers();
      },
      error: (error: HttpErrorResponse) => this.actionError.set(
        this.errorMessage(error, 'Brugeren kunne ikke gemmes. Prøv igen.'),
      ),
    });
  }

  deleteUser(): void {
    const user = this.deletingUser();
    if (!user || this.saving()) return;
    this.saving.set(true);
    this.actionError.set('');
    this.service.deleteUser(user.id).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.saving.set(false)),
    ).subscribe({
      next: () => {
        this.deleteOpen.set(false);
        this.deletingUser.set(null);
        this.users.update((users) => users.filter((entry) => entry.id !== user.id));
        this.successMessage.set('Brugeren er slettet.');
      },
      error: (error: HttpErrorResponse) => this.actionError.set(
        this.errorMessage(error, 'Brugeren kunne ikke slettes. Prøv igen.'),
      ),
    });
  }

  roleLabel(role: string | number): string {
    const labels: Record<string, string> = {
      '1': 'Administrator', administrator: 'Administrator', admin: 'Administrator',
      '2': 'Underviser', teacher: 'Underviser',
      '3': 'Elev', student: 'Elev',
    };
    return labels[String(role).toLowerCase()] ?? 'Ukendt';
  }

  private clearMessages(): void {
    this.actionError.set('');
    this.successMessage.set('');
  }

  private errorMessage(error: HttpErrorResponse, fallback: string): string {
    if (error.status === 403) return 'Du har ikke adgang til denne handling.';
    if (error.status === 401) return 'Serveren kunne ikke godkende din anmodning. Prøv at logge ind igen.';
    if (error.status === 409) return 'En bruger med denne email findes allerede.';
    if (error.status === 404) return 'Brugeren findes ikke længere. Opdater listen.';
    return fallback;
  }
}
