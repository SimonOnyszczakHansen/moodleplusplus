import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { AdminPage } from './admin-page';
import { AdminUser } from './models/admin-user';
import { AdminUsersService } from './services/admin-users';

describe('AdminPage', () => {
  const user: AdminUser = {
    id: 'user-id', name: 'Test User', email: 'test@example.com', role: 3,
    createdAt: '2026-01-01T00:00:00Z', isMissingConsents: false,
  };
  let component: AdminPage;
  let fixture: ComponentFixture<AdminPage>;
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
    fixture = TestBed.createComponent(AdminPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const makeUsers = (count: number): AdminUser[] => Array.from({ length: count }, (_, index) => ({
    ...user, id: `user-${index}`, name: `User ${index + 1}`, email: `user${index + 1}@example.com`,
  }));

  it('renders ten users per page and navigates to a partial last page', () => {
    component.users.set(makeUsers(37));
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelectorAll('tbody tr')).toHaveLength(10);
    expect(element.querySelector('.user-count')?.textContent).toContain('Viser 1–10 brugere ud af 37');
    expect(element.querySelector<HTMLButtonElement>('.pagination button')?.disabled).toBe(true);

    element.querySelector<HTMLButtonElement>('[aria-label="Side 4"]')!.click();
    fixture.detectChanges();
    expect(element.querySelectorAll('tbody tr')).toHaveLength(7);
    expect(element.querySelector('.user-count')?.textContent).toContain('Viser 31–37 brugere ud af 37');
    expect(element.querySelector('[aria-current="page"]')?.textContent).toBe('4');
    expect(element.querySelector<HTMLButtonElement>('.pagination button:last-child')?.disabled).toBe(true);
  });

  it('combines search and role filters and resets pagination when they change', () => {
    component.users.set([
      ...makeUsers(11),
      { ...user, id: 'teacher', name: 'Alice', email: 'alice@school.dk', role: 'Teacher' },
      { ...user, id: 'student', name: 'Alice Student', email: 'student@school.dk', role: '3' },
    ]);
    component.goToPage(2);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const search = element.querySelector<HTMLInputElement>('#user-search')!;
    search.value = '  ALICE  ';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.currentPage()).toBe(1);
    expect(component.filteredUsers()).toHaveLength(2);

    const roles = element.querySelector<HTMLSelectElement>('#user-role-filter')!;
    roles.value = '2';
    roles.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(component.paginatedUsers().map((entry) => entry.id)).toEqual(['teacher']);
    expect(element.querySelectorAll('tbody tr')).toHaveLength(1);

    component.setSearchQuery('SCHOOL.DK');
    expect(component.filteredUsers()).toHaveLength(1);
    component.setRoleFilter('');
    expect(component.filteredUsers()).toHaveLength(2);
    component.setSearchQuery('');
    component.goToPage(2);
    component.setRoleFilter('3');
    expect(component.currentPage()).toBe(1);
    expect(component.filteredUsers()).toHaveLength(12);
  });

  it('shows an empty result count and disables navigation when nothing matches', () => {
    component.setSearchQuery('missing');
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('.user-count')?.textContent).toContain('Viser 0–0 brugere ud af 0');
    expect(element.querySelector('.empty-message')?.textContent).toContain('Ingen brugere matcher');
    expect(element.querySelector<HTMLButtonElement>('.pagination button')?.disabled).toBe(true);
    expect(element.querySelector<HTMLButtonElement>('.pagination button:last-child')?.disabled).toBe(true);
  });

  it('returns to the previous page after deleting the only user on the last page', () => {
    const users = makeUsers(11);
    component.users.set(users);
    component.goToPage(2);
    component.onAction({ action: 'delete', row: users[10] });
    component.deleteUser();
    expect(component.currentPage()).toBe(1);
    expect(component.paginatedUsers()).toHaveLength(10);
    expect(component.lastUser()).toBe(10);
  });

  it('keeps pagination valid when refreshing a smaller list', () => {
    component.users.set(makeUsers(37));
    component.goToPage(4);
    service.getUsers.mockReturnValue(of(makeUsers(12)));
    component.loadUsers();
    expect(component.currentPage()).toBe(2);
    expect(component.paginatedUsers()).toHaveLength(2);
    component.goToPage(100);
    expect(component.currentPage()).toBe(2);
    component.goToPage(0);
    expect(component.currentPage()).toBe(1);
  });

  it('requires a valid name, email, and password to create a user', () => {
    component.openCreate();
    component.userForm.patchValue({ name: '   ', email: 'invalid' });
    component.saveUser();
    expect(service.createUser).not.toHaveBeenCalled();
    expect(component.userForm.touched).toBe(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.create-user-form .error')).toHaveLength(3);
  });

  it('opens a creation row from the toolbar and cancels without saving', () => {
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('.page-header button')).toBeNull();
    element.querySelector<HTMLButtonElement>('.table-toolbar .create-button button')!.click();
    fixture.detectChanges();
    expect(element.querySelector('tbody tr:first-child .create-user-form')).not.toBeNull();
    expect(element.querySelectorAll('.create-user-form input')).toHaveLength(3);
    expect(element.querySelector('.create-user-form select')).not.toBeNull();
    expect(component.editingUser()).toBeNull();
    expect(element.querySelector('dialog[open]')).toBeNull();
    expect(element.querySelector<HTMLButtonElement>('.row-actions button')?.disabled).toBe(true);

    component.userForm.patchValue({ name: 'Draft', password: 'secret' });
    element.querySelector<HTMLButtonElement>('.create-user-actions button')!.click();
    fixture.detectChanges();
    expect(element.querySelector('.create-user-form')).toBeNull();
    expect(component.userForm.controls.password.value).toBe('');
    expect(service.createUser).not.toHaveBeenCalled();
    expect(element.querySelector<HTMLButtonElement>('.row-actions button')?.disabled).toBe(false);
  });

  it('keeps the creation row and values after a failed submission', () => {
    service.createUser.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409 })));
    component.setSearchQuery('no matches');
    component.openCreate();
    component.userForm.setValue({ name: 'New User', email: 'new@example.com', password: 'secret', role: 3 });
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    element.querySelector<HTMLFormElement>('.create-user-form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(component.createOpen()).toBe(true);
    expect(component.userForm.controls.email.value).toBe('new@example.com');
    expect(element.querySelector('.create-user-form .error')?.textContent).toContain('email');
    expect(element.querySelector<HTMLButtonElement>('.create-user-actions button[type="submit"]')?.disabled).toBe(false);
  });

  it('prevents duplicate creation and cancellation while saving, then closes the row', () => {
    const response = new Subject<void>();
    service.createUser.mockReturnValue(response);
    component.openCreate();
    component.userForm.setValue({ name: 'New User', email: 'new@example.com', password: 'secret', role: 2 });
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    element.querySelector<HTMLFormElement>('.create-user-form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    component.saveUser();
    component.cancelCreate();
    fixture.detectChanges();
    expect(service.createUser).toHaveBeenCalledOnce();
    expect(component.createOpen()).toBe(true);
    expect(element.querySelector<HTMLFieldSetElement>('.create-user-fields')?.disabled).toBe(true);
    response.next();
    response.complete();
    fixture.detectChanges();
    expect(element.querySelector('.create-user-form')).toBeNull();
    expect(component.userForm.controls.password.value).toBe('');
    expect(service.getUsers).toHaveBeenCalledTimes(2);
  });

  it('creates a user with the selected numeric role and refreshes the list', () => {
    component.openCreate();
    component.userForm.setValue({ name: ' Teacher ', email: 'teacher@example.com', password: 'secret', role: 2 });
    component.saveUser();
    expect(service.createUser).toHaveBeenCalledWith({
      name: 'Teacher', email: 'teacher@example.com', password: 'secret', role: 2,
    });
    expect(service.getUsers).toHaveBeenCalledTimes(2);
    expect(component.editingUser()).toBeNull();
    expect(component.createOpen()).toBe(false);
    expect(component.userForm.controls.password.value).toBe('');
  });

  it('edits name and email without requiring or sending a password or role', () => {
    component.openCreate();
    component.cancelCreate();
    component.onAction({ action: 'edit', row: user });
    component.userForm.patchValue({ name: 'Updated' });
    component.saveUser();
    expect(service.updateUser).toHaveBeenCalledWith(user.id, { name: 'Updated', email: user.email });
  });

  it('edits the selected row in place and cancels without changing the saved user', () => {
    component.users.set([user, { ...user, id: 'second-user', name: 'Second User' }]);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    element.querySelector<HTMLButtonElement>('.row-actions button')!.click();
    fixture.detectChanges();
    const rows = element.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(2);
    expect(rows[0].querySelector<HTMLInputElement>('#edit-user-name')?.value).toBe(user.name);
    expect(rows[0].querySelector<HTMLInputElement>('#edit-user-email')?.value).toBe(user.email);
    expect(rows[0].querySelector('.edit-user-form')).not.toBeNull();
    expect(rows[1].querySelector('input')).toBeNull();
    expect(element.querySelector('dialog[open]')).toBeNull();
    expect(element.querySelector<HTMLInputElement>('#user-search')?.disabled).toBe(true);
    expect(element.querySelector<HTMLSelectElement>('#user-role-filter')?.disabled).toBe(true);
    expect(element.querySelector<HTMLButtonElement>('.create-button button')?.disabled).toBe(true);
    expect(rows[1].querySelector<HTMLButtonElement>('button')?.disabled).toBe(true);

    component.userForm.patchValue({ name: 'Unsaved change' });
    element.querySelector<HTMLButtonElement>('.edit-user-form button[type="button"]')!.click();
    fixture.detectChanges();
    expect(element.querySelector('#edit-user-name')).toBeNull();
    expect(rows[0].textContent).toContain(user.name);
    expect(component.users()[0]).toEqual(user);
    expect(service.updateUser).not.toHaveBeenCalled();
    expect(element.querySelector<HTMLInputElement>('#user-search')?.disabled).toBe(false);
  });

  it('submits inline changes and prevents duplicate saves or cancellation while saving', () => {
    const response = new Subject<AdminUser>();
    service.updateUser.mockReturnValue(response);
    component.onAction({ action: 'edit', row: user });
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const name = element.querySelector<HTMLInputElement>('#edit-user-name')!;
    name.value = 'Updated name';
    name.dispatchEvent(new Event('input'));
    const email = element.querySelector<HTMLInputElement>('#edit-user-email')!;
    email.value = 'updated@example.com';
    email.dispatchEvent(new Event('input'));
    expect(name.form?.id).toBe('edit-user-form');
    element.querySelector<HTMLFormElement>('.edit-user-form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    component.saveUser();
    component.cancelEdit();
    fixture.detectChanges();
    expect(service.updateUser).toHaveBeenCalledExactlyOnceWith(user.id, { name: 'Updated name', email: 'updated@example.com' });
    expect(component.editingUser()).toEqual(user);
    expect(element.querySelector<HTMLFieldSetElement>('.edit-user-field')?.disabled).toBe(true);
    const updated = { ...user, name: 'Updated name', email: 'updated@example.com' };
    service.getUsers.mockReturnValue(of([updated]));
    response.next(updated);
    response.complete();
    fixture.detectChanges();
    expect(element.querySelector('.edit-user-form')).toBeNull();
    expect(element.querySelector('tbody')?.textContent).toContain('Updated name');
    expect(component.editingUser()).toBeNull();
  });

  it('shows validation and server errors in the editing row and allows retry', () => {
    component.onAction({ action: 'edit', row: user });
    component.userForm.patchValue({ name: ' ', email: 'invalid' });
    component.saveUser();
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(service.updateUser).not.toHaveBeenCalled();
    expect(element.querySelectorAll('.edit-user-field .error')).toHaveLength(2);

    service.updateUser.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 409 })));
    component.userForm.patchValue({ name: 'Updated', email: 'updated@example.com' });
    component.saveUser();
    fixture.detectChanges();
    expect(element.querySelector('.edit-user-form .error')?.textContent).toContain('email');
    expect(element.querySelector<HTMLInputElement>('#edit-user-name')?.value).toBe('Updated');
    component.saveUser();
    fixture.detectChanges();
    expect(service.updateUser).toHaveBeenCalledTimes(2);
    expect(element.querySelector('.edit-user-form')).toBeNull();
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
    expect(component.editingUser()).toEqual(user);
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
