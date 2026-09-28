import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { AdminPage } from './admin-page';
import { AdminUser } from './models/admin-user.model';
import { AdminUsersService } from './services/admin-users';

describe('AdminPage', () => {
  const user: AdminUser = {
    id: 'user-id', name: 'Test User', email: 'test@example.com', role: 3,
    createdAt: '2026-01-01T00:00:00Z', isMissingConsents: false,
  };
  let component: AdminPage;
  let service: {
    getUsers: ReturnType<typeof vi.fn>;
    createUser: ReturnType<typeof vi.fn>;
    updateUser: ReturnType<typeof vi.fn>;
    deleteUser: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    service = {
      getUsers: vi.fn(() => of([user])),
      createUser: vi.fn(() => of(undefined)),
      updateUser: vi.fn(() => of(user)),
      deleteUser: vi.fn(() => of(undefined)),
    };
    TestBed.configureTestingModule({
      imports: [AdminPage],
      providers: [{ provide: AdminUsersService, useValue: service }],
    });
    component = TestBed.createComponent(AdminPage).componentInstance;
    component.ngOnInit();
  });

  it('requires a valid name, email, and password to create a user', () => {
    component.openCreate();
    component.userForm.patchValue({ name: '   ', email: 'invalid' });
    component.saveUser();
    expect(service.createUser).not.toHaveBeenCalled();
    expect(component.userForm.touched).toBe(true);
  });

  it('creates a user with the selected numeric role and refreshes the list', () => {
    component.openCreate();
    component.userForm.setValue({ name: ' Teacher ', email: 'teacher@example.com', password: 'secret', role: 2 });
    component.saveUser();
    expect(service.createUser).toHaveBeenCalledWith({
      name: 'Teacher', email: 'teacher@example.com', password: 'secret', role: 2,
    });
    expect(service.getUsers).toHaveBeenCalledTimes(2);
    expect(component.editorOpen()).toBe(false);
    expect(component.userForm.controls.password.value).toBe('');
  });

  it('edits name and email without requiring or sending a password or role', () => {
    component.openCreate();
    component.onAction({ action: 'edit', row: user });
    component.userForm.patchValue({ name: 'Updated' });
    component.saveUser();
    expect(service.updateUser).toHaveBeenCalledWith(user.id, { name: 'Updated', email: user.email });
  });

  it('requires delete confirmation and prevents duplicate submissions', () => {
    const response = new Subject<void>();
    service.deleteUser.mockReturnValue(response);
    component.onAction({ action: 'delete', row: user });
    expect(service.deleteUser).not.toHaveBeenCalled();
    expect(component.deleteOpen()).toBe(true);
    component.deleteUser();
    component.deleteUser();
    expect(service.deleteUser).toHaveBeenCalledOnce();
    expect(component.users()).toEqual([user]);
    response.next();
    response.complete();
    expect(component.users()).toEqual([]);
    expect(component.deleteOpen()).toBe(false);
    expect(component.saving()).toBe(false);
  });

  it('preserves the user and allows retry after a failed deletion', () => {
    service.deleteUser.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    component.onAction({ action: 'delete', row: user });
    component.deleteUser();
    expect(component.users()).toEqual([user]);
    expect(component.deleteOpen()).toBe(true);
    expect(component.actionError()).toBeTruthy();
    expect(component.saving()).toBe(false);
  });

  it('keeps form values when saving fails', () => {
    service.updateUser.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409 })));
    component.onAction({ action: 'edit', row: user });
    component.saveUser();
    expect(component.editorOpen()).toBe(true);
    expect(component.userForm.controls.email.value).toBe(user.email);
    expect(component.actionError()).toContain('email');
    expect(component.saving()).toBe(false);
  });

  it('reports a forbidden list response and supports retry', () => {
    service.getUsers.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 403 })));
    component.loadUsers();
    expect(component.loadError()).toBeTruthy();
    expect(component.loading()).toBe(false);
    component.loadUsers();
    expect(component.loadError()).toBe('');
    expect(component.users()).toEqual([user]);
  });

  it('does not report an expired session for every unauthorized response', () => {
    service.getUsers.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 401 })));
    component.loadUsers();
    expect(component.loadError()).toContain('kunne ikke godkende');
    expect(component.loadError()).not.toContain('udløbet');
  });
});
