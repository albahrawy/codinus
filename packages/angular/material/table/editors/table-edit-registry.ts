import { ElementRef, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SMOOTH_SCHEDULER } from "@ngx-codinus/core/shared";
import { auditTime, filter, fromEvent, merge } from "rxjs";
import { CODINUS_DATA_SOURCE_DIRECTIVE } from "../data/types";
import { ICSTableEditorContext } from "../shared/types";



export class CSTableEditRegistryHandler<TData> {
    private _elementRef = inject(ElementRef);
    private readonly _dataSourceDirective = inject(CODINUS_DATA_SOURCE_DIRECTIVE, { self: true });
    private _activeEditorContext: ICSTableEditorContext<TData> | null = null;
    private _inEditMode = signal(false);

    private readonly _focusOutStream = merge(
        fromEvent<MouseEvent>(this._elementRef.nativeElement, 'mousedown'),
        //TODO: fix this with overlays
        //        fromEvent<MouseEvent>(document, 'mousedown'),
        fromEvent<FocusEvent>(this._elementRef.nativeElement, 'focusin'))
        .pipe(
            takeUntilDestroyed(),
            filter((e) =>
                !!this._activeEditorContext && !!e.target &&
                !this._activeEditorContext?.editor.element.contains(e.target as Node)
            ),
            auditTime(0, SMOOTH_SCHEDULER),
        );

    constructor() {
        this._focusOutStream.subscribe(() => this.unregister(true));
    }

    get activeEditorContext() { return this._activeEditorContext; }

    inEditMode = this._inEditMode.asReadonly();

    /**
    * Registers a new editor context and sets the edit mode accordingly.
    * 
    * @param editor - The editor context to register. If null, the edit mode will be disabled.
    */
    register(editor: ICSTableEditorContext<TData> | null) {
        this.unregister(true);
        this._activeEditorContext = editor;
        this._inEditMode.set(editor != null);
    }

    /**
     * Unregisters the current editor context.
     * @param commit - If true, commits any pending changes in the current editor context.
     */
    unregister(commit: boolean) {
        const currentContext = this._activeEditorContext;
        if (!currentContext?.editor)
            return;
        this._activeEditorContext = null;
        this._inEditMode.set(false);
        if (commit)
            currentContext.editor.commitPending();
    }

    getEditorContext(key?: string, rowData?: TData | null) {
        const { data, columnKey } = this._activeEditorContext ?? {};
        if (columnKey && rowData && columnKey === key && rowData === data)
            return this._activeEditorContext;
        return null;
    }

    notify(affected: TData) {
        //this._dataSourceDirective.notifyChanged();
        this._dataSourceDirective.notifyModified('update', [affected]);
    }
}