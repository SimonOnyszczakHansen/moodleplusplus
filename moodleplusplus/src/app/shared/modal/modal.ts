import { afterRenderEffect, Component, ElementRef, input, model, viewChild } from '@angular/core';

@Component({
	selector: 'app-modal',
	imports: [],
	templateUrl: './modal.html',
	styleUrl: './modal.css',
})
export class Modal {
	readonly title = input('');
	readonly dismissible = input(true);
	readonly open = model(false);
	private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

	constructor() {
		afterRenderEffect(() => {
			const dialog = this.dialog().nativeElement;

			if (this.open() && !dialog.open) {
				dialog.showModal();
			} else if (!this.open() && dialog.open) {
				dialog.close();
			}
		});
	}

	close() {
		if (this.dismissible()) this.open.set(false);
	}

	onCancel(event: Event) {
		event.preventDefault();
		this.close();
	}

	onNativeClose() {
		// Ignore a queued close event if the modal has already reopened.
		if (!this.dialog().nativeElement.open) {
			this.close();
		}
	}
}
