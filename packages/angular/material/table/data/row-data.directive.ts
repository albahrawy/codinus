import { Directive } from '@angular/core';
import { CSRowDataContextBase } from './data-context.directive';

@Directive({
    selector: 'cdk-row,mat-row',
})
export class CSRowDataDirective<T> extends CSRowDataContextBase<T> { }