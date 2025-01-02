import { Directive, booleanAttribute, input, output } from '@angular/core';

@Directive({
    selector: '[csfileDrop]',
    host: {
        '[class.drop-zone-active]': '_active',
        '(drop)': '_onDrop($event)',
        '(dragover)': '_onDragOver($event)',
        '(dragleave)': '_onDragLeave($event)',
        '(body:dragover)': '_onBodyDragOver($event)',
        '(body:drop)': '_onBodyDrop($event)',
    }
})
export class CSFileDropZone {

    csfileDrop = output<DragEvent>();
    preventBodyDrop = input(true, { transform: booleanAttribute });
    disableDrop = input(false, { transform: booleanAttribute });
    dropEffect = input<'none' | 'copy' | 'link' | 'move'>('copy');

    protected _active = false;

    protected _onDrop(event: DragEvent): void {
        if (this.disableDrop())
            return;
        event.preventDefault();
        this._active = false;
        this.csfileDrop.emit(event);
    }

    protected _onDragOver(event: DragEvent): void {
        if (this.disableDrop())
            return;
        event.stopPropagation();
        event.preventDefault();
        if (event.dataTransfer)
            event.dataTransfer.dropEffect = this.dropEffect();
        this._active = true;
    }

    protected _onDragLeave(): void {
        if (this.disableDrop())
            return;
        this._active = false;
    }

    protected _onBodyDragOver(event: DragEvent): void {
        if (this.disableDrop())
            return;
        if (this.preventBodyDrop()) {
            event.stopImmediatePropagation();
            event.preventDefault();
            event.stopPropagation();
            if (event.dataTransfer) {
                event.dataTransfer.effectAllowed = 'none';
                event.dataTransfer.dropEffect = 'none';
            }

        }
    }

    protected _onBodyDrop(event: DragEvent): void {
        if (this.disableDrop())
            return;
        if (this.preventBodyDrop()) {
            event.stopImmediatePropagation();
            event.preventDefault();
            event.stopPropagation();
            if (event.dataTransfer) {
                event.dataTransfer.dropEffect = 'none';
                event.dataTransfer.effectAllowed = 'none';
            }
        }
    }
}
