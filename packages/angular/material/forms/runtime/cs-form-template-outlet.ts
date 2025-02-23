/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
    computed,
    Directive, effect, EmbeddedViewRef, inject, input, ViewContainerRef
} from '@angular/core';

import { ControlContainer } from '@angular/forms';
import { ICSRuntimeFormFieldBase } from './cs-element-base/types';
import {
    CODINUS_RUNTIME_FORM_HANDLER, CODINUS_RUNTIME_FORM_OPTIONS,
    CODINUS_RUNTIME_FORM_SECTION, DefaultRuntimeFormOptions
} from './injection-tokens';

/**
 * @description
 *
 * Inspired by angular ngTemplateOutlet to inserts an embedded view from a prepared `TemplateRef` using signal and current injector.
 *
 * You can attach a context object to the `EmbeddedViewRef` by setting `[csFormTemplateOutletContext]`.
 * `[csFormTemplateOutletContext]` should be an object, the object's keys will be available for binding
 * by the local template `let` declarations.
 *
 * @usageNotes
 * ```html
 * <ng-container *csFormTemplateOutlet="templateRefExp; context: contextExp"></ng-container>
 * ```
 *
 * Using the key `$implicit` in the context object will set its value as default.
 *
 *
 */
@Directive({
    selector: '[csFormTemplateOutlet]',
})
export class CSFormTemplateOutlet<C = unknown> {
    private _viewRef: EmbeddedViewRef<C> | null = null;
    private _viewContainerRef = inject(ViewContainerRef);
    private _csFormContainer = inject(CODINUS_RUNTIME_FORM_SECTION);
    private _runtimeFormHandler = inject(CODINUS_RUNTIME_FORM_HANDLER);
    private _options = inject(CODINUS_RUNTIME_FORM_OPTIONS, { optional: true }) ?? DefaultRuntimeFormOptions;

    csFormTemplateOutlet = input<ICSRuntimeFormFieldBase & { type: string }>();
    csFormTemplateOutletSection = input<ControlContainer>();

    private _context = computed(() => ({
        $implicit: this.csFormTemplateOutlet(),
        section: this.csFormTemplateOutletSection() ?? this._csFormContainer.parentSection,
        formHandler: this._runtimeFormHandler
    }));

    /**
     * A string defining the template reference and optionally the context object for the template.
     */
    private _template = computed(() => {
        const templates = this._runtimeFormHandler.templates() ?? [];
        const config = this.csFormTemplateOutlet();
        let templeteName = config?.templateName;
        const type = config?.type;
        if (!templeteName && type)
            templeteName = this._options.templateMaps?.[type] ?? this._options.templateMaps?.['default'] ?? 'default';

        if (!templeteName)
            return null;
        return templates.find(t => t.name() === templeteName)?.template ?? null;
    });

    constructor() {
        effect(() => {
            const viewContainerRef = this._viewContainerRef;
            if (this._viewRef)
                viewContainerRef.remove(viewContainerRef.indexOf(this._viewRef));
            const template = this._template();

            // If there is no outlet, clear the destroyed view ref.
            if (!template) {
                this._viewRef = null;
                return;
            }

            this._viewRef = viewContainerRef.createEmbeddedView(template, this._context(), {
                injector: this._csFormContainer.injector ?? this._runtimeFormHandler.injector ?? undefined,
            });

        });
    }
}