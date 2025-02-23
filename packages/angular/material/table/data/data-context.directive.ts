import { CdkCellOutletRowContext } from '@angular/cdk/table';
import { Directive, ViewContainerRef, inject } from '@angular/core';
import { signalPropertyOf } from '@ngx-codinus/core/shared';
const CONTXT_VIEW_INDEX = 8;

interface ILView {
    _hostLView: Array<unknown>;
}

@Directive()
export abstract class CSRowDataContextBase<T> {

    private _viewContainer = inject(ViewContainerRef);
    private _context = (this._viewContainer as unknown as ILView)._hostLView[CONTXT_VIEW_INDEX] as CdkCellOutletRowContext<T>;
    private _rowData = signalPropertyOf(this._context, '$implicit');

    protected get rowContext() { return this._context; }
    get rowData(): T | null { return this._rowData() ?? null; }
}