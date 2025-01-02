import { Overlay, OverlayContainer } from '@angular/cdk/overlay';
import { inject, Injectable, OnDestroy } from '@angular/core';
import { Nullable } from '@codinus/types';

/** Container inside which all overlays will render. */
@Injectable({ providedIn: 'root' })
export class CSRelativeOverlayContainer extends OverlayContainer implements OnDestroy {
    private _relativeContainers: { primary: HTMLElement, secondary: HTMLElement } | null = null;
    private _current: 'secondary' | 'primary' | null = null;
    /**
     * This method returns the overlay container element. It will lazily
     * create the element the first time it is called to facilitate using
     * the container in non-browser environments.
     * @returns the container element
     */

    public setCurrentContainerElement(element: Nullable<HTMLElement>): void {

        const containers = this._createRelativeContainers();

        if (element == null) {
            if (this._current != null) {
                containers[this._current].parentElement?.classList.remove('cs-overlay-relative-position');
                containers[this._current].remove();
                this._current = null;
            }
        } else {
            this._current = this._current === 'primary' ? 'secondary' : 'primary';
            element.insertBefore(containers[this._current], element.firstChild);
            containers[this._current].parentElement?.classList.add('cs-overlay-relative-position');
        }
    }

    override getContainerElement(): HTMLElement {
        if (this._relativeContainers != null && this._current != null)
            return this._relativeContainers[this._current];
        else
            return super.getContainerElement();
    }

    /**
     * Create the overlay container element, which is simply a div
     * with the 'cdk-overlay-container' class on the document body.
     */

    protected _createRelativeContainers() {
        if (!this._relativeContainers)
            this._relativeContainers =
                { primary: this._createRelativeContainer(), secondary: this._createRelativeContainer() };
        return this._relativeContainers;
    }

    private _createRelativeContainer() {
        const container = this._document.createElement('div');
        container.classList.add('cdk-overlay-container', 'cdk-overlay-container-relative');
        return container;
    }
}

@Injectable({ providedIn: 'root' })
//@ts-expect-error override private property
export class CSRelativeOverlay extends Overlay {

    private override _overlayContainer = inject(CSRelativeOverlayContainer);

    attachElementToContainer(element: Nullable<HTMLElement>): void {
        this._overlayContainer.setCurrentContainerElement(element);
    }
}