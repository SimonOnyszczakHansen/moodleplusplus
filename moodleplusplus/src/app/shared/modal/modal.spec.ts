import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { Modal } from './modal';

describe('Modal', () => {
	let component: Modal;
	let fixture: ComponentFixture<Modal>;
	let dialog: HTMLDialogElement;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [Modal]
		})
			.compileComponents();

		fixture = TestBed.createComponent(Modal);
		component = fixture.componentInstance;
		dialog = fixture.nativeElement.querySelector('dialog');
		// jsdom has no native modal behavior; verify our integration with its API.
		dialog.showModal = vi.fn(() => { dialog.open = true; });
		dialog.close = vi.fn(() => {
			dialog.open = false;
			dialog.dispatchEvent(new Event('close'));
		});
		await fixture.whenStable();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
		expect(dialog.open).toBe(false);
	});

	it('opens and closes when the parent changes open', async () => {
		fixture.componentRef.setInput('title', 'Create group');
		fixture.componentRef.setInput('open', true);
		await fixture.whenStable();

		expect(dialog.showModal).toHaveBeenCalledOnce();
		expect(dialog.getAttribute('aria-label')).toBe('Create group');

		fixture.componentRef.setInput('open', false);
		await fixture.whenStable();
		expect(dialog.close).toHaveBeenCalledOnce();
	});

	it('notifies the parent when the close button is clicked', async () => {
		const changed = vi.fn();
		component.open.subscribe(changed);
		fixture.componentRef.setInput('open', true);
		await fixture.whenStable();

		fixture.nativeElement.querySelector('button').click();
		await fixture.whenStable();

		expect(changed).toHaveBeenCalledWith(false);
		expect(dialog.open).toBe(false);
	});

	it('handles Escape through the native cancel event', async () => {
		fixture.componentRef.setInput('open', true);
		await fixture.whenStable();

		dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
		await fixture.whenStable();

		expect(component.open()).toBe(false);
		expect(dialog.open).toBe(false);
	});

	it('syncs native form dismissal back to the parent', async () => {
		fixture.componentRef.setInput('open', true);
		await fixture.whenStable();

		dialog.close();
		await fixture.whenStable();

		expect(component.open()).toBe(false);
	});
});
