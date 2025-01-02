import { Component, Directive, ElementRef, inject, input, viewChildren } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import {
    MatSnackBarHorizontalPosition,
    MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { CSSnackBar } from '@ngx-codinus/material/overlays';
import { MatGridListModule } from '@angular/material/grid-list';

@Directive({ selector: '[elementId]' })
export class ElementIdDirective {
    elementRef = inject(ElementRef);
    elementId = input('');
}

/**
 * @title Snack-bar with configurable position
 */
@Component({
    selector: 'snack-bar-position-example',
    templateUrl: './snack-bar.html',
    styles: [`
                mat-form-field {margin-right: 12px;}
                mat-grid-tile {background: lightblue;}
            `],
    imports: [MatFormFieldModule, MatSelectModule, MatButtonModule, MatGridListModule, ElementIdDirective],
})
export class SnackBarExampleComponent {
    private _snackBar = inject(CSSnackBar);

    horizontalPosition: MatSnackBarHorizontalPosition = 'start';
    verticalPosition: MatSnackBarVerticalPosition = 'bottom';
    elements = viewChildren(ElementIdDirective);
    elementId = '';

    openSnackBar() {
        this._snackBar.open('Cannonball!!', 'Splash', {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            element: this.elements().find(e => e.elementId() == this.elementId)?.elementRef.nativeElement
        });
    }
}
