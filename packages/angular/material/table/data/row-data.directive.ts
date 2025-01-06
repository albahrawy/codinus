import { CdkCellOutletRowContext } from '@angular/cdk/table';
import { Directive, ViewContainerRef, inject } from '@angular/core';
 const CONTXT_VIEW_INDEX = 8;

interface ILView {
    _hostLView: Array<unknown>;
}

@Directive({
    selector: 'cdk-row,mat-row',
})
export class CSRowDataDirective<T> {

    private _viewContainer = inject(ViewContainerRef);
    private _context = (this._viewContainer as unknown as ILView)._hostLView[CONTXT_VIEW_INDEX];

    get context(): CdkCellOutletRowContext<T> { return this._context as CdkCellOutletRowContext<T>; }
    get data(): T | undefined { return this.context.$implicit; }
}