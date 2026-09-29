import { Component, ElementRef, HostListener, inject, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-action-menu',
  imports: [],
  templateUrl: './action-menu.html',
  styleUrl: './action-menu.css',
})
export class ActionMenu {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly toggleButton = viewChild.required<ElementRef<HTMLButtonElement>>('toggleButton');
  // Bound so the same reference can be added/removed from window listeners.
  private readonly closeOnScrollOrResize = () => this.close();

  readonly open = signal(false);
  readonly panelTop = signal(0);
  readonly panelRight = signal(0);

  toggle(): void {
    this.open() ? this.close() : this.openMenu();
  }

  private openMenu(): void {
    // position: fixed + viewport coords so the panel escapes the table's overflow:auto clipping.
    const rect = this.toggleButton().nativeElement.getBoundingClientRect();
    this.panelTop.set(rect.bottom + 4);
    this.panelRight.set(window.innerWidth - rect.right);
    this.open.set(true);
    window.addEventListener('scroll', this.closeOnScrollOrResize, true);
    window.addEventListener('resize', this.closeOnScrollOrResize);
  }

  close(): void {
    this.open.set(false);
    window.removeEventListener('scroll', this.closeOnScrollOrResize, true);
    window.removeEventListener('resize', this.closeOnScrollOrResize);
  }

  // Closes the menu on any click outside this component's host element.
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }
}
