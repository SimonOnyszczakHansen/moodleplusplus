import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { vi } from 'vitest';
import { GroupsPage } from './groups-page';
import { GroupsService } from './services/groups';
import { GroupDetails } from './models/group.model';

describe('GroupsPage', () => {
  const alice = { id: 's1', name: 'Alice', email: 'alice@school.dk', role: 3 };
  const bob = { id: 's2', name: 'Bob', email: 'bob@school.dk', role: 3 };
  const group: GroupDetails = {
    id: 'g1', name: 'Group 1', createdAt: '2026-09-29',
    students: [{ id: alice.id, name: alice.name, addedAt: '2026-09-29' }],
  };
  let component: GroupsPage;
  let fixture: ComponentFixture<GroupsPage>;
  let service: {
    getGroups: ReturnType<typeof vi.fn>; getStudents: ReturnType<typeof vi.fn>;
    getGroup: ReturnType<typeof vi.fn>; createGroup: ReturnType<typeof vi.fn>;
    renameGroup: ReturnType<typeof vi.fn>; addMembers: ReturnType<typeof vi.fn>;
    removeMembers: ReturnType<typeof vi.fn>; deleteGroup: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = {
      getGroups: vi.fn(() => of([group])), getStudents: vi.fn(() => of([alice, bob])),
      getGroup: vi.fn(() => of(group)), createGroup: vi.fn(() => of(group)),
      renameGroup: vi.fn(() => of(group)), addMembers: vi.fn(() => of(undefined)),
      removeMembers: vi.fn(() => of(undefined)), deleteGroup: vi.fn(() => of(undefined)),
    };
    TestBed.configureTestingModule({ imports: [GroupsPage], providers: [{ provide: GroupsService, useValue: service }] });
    fixture = TestBed.createComponent(GroupsPage);
    component = fixture.componentInstance;
    fixture.nativeElement.querySelectorAll('dialog').forEach((dialog: HTMLDialogElement) => {
      dialog.showModal = vi.fn(() => { dialog.open = true; });
      dialog.close = vi.fn(() => { dialog.open = false; });
    });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('renders names and emails and opens the create dialog from the page', async () => {
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('.group-card')?.textContent).toContain('Alice');
    expect(element.querySelector('.group-card')?.textContent).toContain('alice@school.dk');
    element.querySelector<HTMLButtonElement>('.page-header button')!.click();
    await fixture.whenStable();
    expect(element.querySelector('dialog')!.open).toBe(true);
    expect(component.selectedStudents()).toEqual([]);
  });

  it('searches names and emails while preserving the search and selected students', () => {
    component.openEditor(group);
    component.search.set(' SCHOOL.DK ');
    expect(component.filteredStudents()).toEqual([alice, bob]);
    component.addStudent(bob);
    component.addStudent(bob);
    expect(component.selectedStudents()).toHaveLength(2);
    expect(component.search()).toBe(' SCHOOL.DK ');
    component.removeStudent(alice.id);
    component.search.set('ALICE');
    expect(component.filteredStudents()).toEqual([alice]);
  });

  it('lets the teacher select multiple students and deselect them without reopening the picker', async () => {
    component.openEditor();
    await fixture.whenStable();
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const checkboxes = element.querySelectorAll<HTMLInputElement>('.search-results input[type="checkbox"]');
    expect(checkboxes).toHaveLength(2);
    checkboxes[0].click();
    fixture.detectChanges();
    checkboxes[1].click();
    fixture.detectChanges();
    expect(component.selectedStudents().map((student) => student.id)).toEqual(['s1', 's2']);
    expect(element.querySelectorAll('.search-results input:checked')).toHaveLength(2);
    expect(component.editorOpen()).toBe(true);
    checkboxes[0].click();
    fixture.detectChanges();
    expect(component.selectedStudents().map((student) => student.id)).toEqual(['s2']);
    component.search.set('Alice');
    fixture.detectChanges();
    expect(component.selectedStudentIds().has('s2')).toBe(true);
  });

  it('validates trimmed names before creating a group', async () => {
    component.openEditor();
    component.name.set('   ');
    await component.save();
    expect(service.createGroup).not.toHaveBeenCalled();
    expect(component.formError()).toContain('1 og 200');
  });

  it('creates a group, then adds the selected members', async () => {
    component.openEditor();
    component.name.set(' Group 1 ');
    component.addStudent(alice);
    await component.save();
    expect(service.createGroup).toHaveBeenCalledWith('Group 1');
    expect(service.addMembers).toHaveBeenCalledWith('g1', ['s1']);
    expect(service.removeMembers).not.toHaveBeenCalled();
    expect(component.editorOpen()).toBe(false);
  });

  it('saves only membership differences when editing', async () => {
    component.openEditor(group);
    component.removeStudent(alice.id);
    component.addStudent(bob);
    component.name.set('Renamed');
    await component.save();
    expect(service.renameGroup).toHaveBeenCalledWith('g1', 'Renamed');
    expect(service.addMembers).toHaveBeenCalledWith('g1', ['s2']);
    expect(service.removeMembers).toHaveBeenCalledWith('g1', ['s1']);
    expect(service.createGroup).not.toHaveBeenCalled();
  });

  it('retains a created group after a membership failure and retries without duplicates', async () => {
    service.getGroup.mockReturnValue(of({ ...group, students: [] }));
    service.addMembers.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 500 })));
    component.openEditor();
    component.name.set(group.name);
    component.addStudent(alice);
    await component.save();
    expect(component.editorOpen()).toBe(true);
    expect(component.editingId()).toBe('g1');
    expect(component.formError()).toContain('Nogle ændringer er gemt');
    expect(component.groups()[0].students).toEqual([]);
    await component.save();
    expect(service.createGroup).toHaveBeenCalledTimes(1);
    expect(service.addMembers).toHaveBeenCalledTimes(2);
    expect(component.editorOpen()).toBe(false);
  });

  it('supports empty groups and does not send empty membership requests', async () => {
    component.openEditor();
    component.name.set(group.name);
    await component.save();
    expect(service.addMembers).not.toHaveBeenCalled();
    expect(service.removeMembers).not.toHaveBeenCalled();
  });

  it('prevents duplicate submissions while saving', async () => {
    const pending = new Subject<GroupDetails>();
    service.createGroup.mockReturnValue(pending);
    component.openEditor();
    component.name.set(group.name);
    const firstSave = component.save();
    await component.save();
    expect(service.createGroup).toHaveBeenCalledTimes(1);
    expect(component.saving()).toBe(true);
    pending.next(group);
    pending.complete();
    await firstSave;
    expect(component.saving()).toBe(false);
  });

  it('keeps the group when deletion fails and removes it after a successful retry', async () => {
    service.deleteGroup.mockReturnValueOnce(throwError(() => new Error('offline')));
    component.requestDelete(group);
    await component.deleteGroup();
    expect(component.groups()).toHaveLength(1);
    expect(component.deleteError()).toBeTruthy();
    await component.deleteGroup();
    expect(component.groups()).toEqual([]);
    expect(component.deletingGroup()).toBe(null);
  });

  it('shows a recoverable loading error', async () => {
    service.getGroups.mockReturnValueOnce(throwError(() => new Error('offline')));
    await component.load();
    expect(component.pageError()).toBeTruthy();
    expect(component.loading()).toBe(false);
    await component.load();
    expect(component.pageError()).toBe('');
    expect(component.groups()).toEqual([group]);
  });
});
