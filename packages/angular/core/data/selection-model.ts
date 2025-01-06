import { isDevMode, signal } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Class to be used to power selecting one or more options from a list.
 */
export class CSSelectionModel<T> {
    /** Currently-selected values. */
    private _selection = new Set<T>();
    private _selected: T[] | null = null;

    /** Keeps track of the deselected options that haven't been emitted by the change event. */
    private _deselectedToEmit: T[] = [];

    /** Keeps track of the selected options that haven't been emitted by the change event. */
    private _selectedToEmit: T[] = [];

    /** Cache for the array value of the selected items. */
    changedSignal = signal<CSSelectionChange<T> | null>(null);

    /** Event emitted when the value has changed. */
    readonly changed = new Subject<CSSelectionChange<T>>();

    get selected(): T[] {
        if (!this._selected) {
            this._selected = Array.from(this._selection.values());
        }
        return this._selected;
    }

    constructor(
        private _multiple = false,
        initiallySelectedValues?: T[],
        private _emitChanges = true,
        public compareWith?: (o1: T, o2: T) => boolean,
    ) {
        if (initiallySelectedValues && initiallySelectedValues.length) {
            if (_multiple) {
                initiallySelectedValues.forEach(value => this._markSelected(value, false));
            } else {
                this._markSelected(initiallySelectedValues[0], false);
            }
        }
    }

    /**
     * Selects a value or an array of values.
     * @param values The values to select
     * @return Whether the selection changed as a result of this call
     */
    select(...values: T[]): boolean {
        this._verifyValueAssignment(values);
        values.forEach(value => this._markSelected(value));
        const changed = this._hasQueuedChanges();
        this._emitChangeEvent();
        return changed;
    }

    /**
     * Deselects a value or an array of values.
     * @param values The values to deselect
     * @return Whether the selection changed as a result of this call
     */
    deselect(...values: T[]): boolean {
        this._verifyValueAssignment(values);
        values.forEach(value => this._unmarkSelected(value));
        const changed = this._hasQueuedChanges();
        this._emitChangeEvent();
        return changed;
    }

    /**
     * Sets the selected values
     * @param values The new selected values
     * @return Whether the selection changed as a result of this call
     */
    setSelection(...values: T[]): boolean {
        this._verifyValueAssignment(values);
        const oldValues = this.selected;
        const newSelectedSet = new Set(values);
        values.forEach(value => this._markSelected(value));
        oldValues?.filter(value => !newSelectedSet.has(this._getConcreteValue(value, newSelectedSet)))
            .forEach(value => this._unmarkSelected(value));
        const changed = this._hasQueuedChanges();
        this._emitChangeEvent();
        return changed;
    }

    /**
     * Toggles a value between selected and deselected.
     * @param value The value to toggle
     * @return Whether the selection changed as a result of this call
     */
    toggle(value: T): boolean {
        return this.isSelected(value) ? this.deselect(value) : this.select(value);
    }

    /**
     * Clears all of the selected values.
     * @param flushEvent Whether to flush the changes in an event.
     *   If false, the changes to the selection will be flushed along with the next event.
     * @return Whether the selection changed as a result of this call
     */
    clear(flushEvent = true): boolean {
        this._unmarkAll();
        const changed = this._hasQueuedChanges();
        if (flushEvent) {
            this._emitChangeEvent();
        }
        return changed;
    }

    /**
    * Sorts the selected values based on a predicate function.
    */
    sort(predicate?: (a: T, b: T) => number): void {
        if (this._multiple && this.selected) {
            this.selected.sort(predicate);
        }
    }

    /**
     * Determines whether a value is selected.
     */
    isSelected(value: T): boolean {
        return this._selection.has(this._getConcreteValue(value));
    }

    /**
     * Determines whether the model does not have a value.
     */
    isEmpty(): boolean {
        return this._selection.size === 0;
    }

    /**
     * Determines whether the model has a value.
     */
    hasValue(): boolean {
        return !this.isEmpty();
    }

    /**
     * Gets whether multiple values can be selected.
     */
    get multiple() {
        return this._multiple;
    }
    set multiple(value: boolean) {
        if (value != this.multiple) {
            if (this._multiple != value) {
                if (!value && this._selection.size > 0) {
                    const firstValue = this._selection.values().next().value;
                    this._selection.clear();
                    if (firstValue)
                        this._selection.add(firstValue);
                }
                this._multiple = value;
                this._deselectedToEmit = [];
                this._selectedToEmit = [];
                this.changedSignal.set(null);
            }
        }
    }

    /** Emits a change event and clears the records of selected and deselected values. */
    private _emitChangeEvent() {
        // Clear the selected values so they can be re-cached.
        this._selected = null;

        if (this._selectedToEmit.length || this._deselectedToEmit.length) {
            const args = {
                source: this,
                added: this._selectedToEmit,
                removed: this._deselectedToEmit,
            };
            this.changed.next(args);
            this.changedSignal.set(args);
            this._deselectedToEmit = [];
            this._selectedToEmit = [];
        }
    }

    /** Selects a value. */
    private _markSelected(value: T, emitChanges = true) {
        value = this._getConcreteValue(value);
        if (!this.isSelected(value)) {
            if (!this._multiple) {
                this._unmarkAll();
            }

            if (!this.isSelected(value)) {
                this._selection.add(value);
            }

            if (emitChanges && this._emitChanges) {
                this._selectedToEmit.push(value);
            }
        }
    }

    /** Deselects a value. */
    private _unmarkSelected(value: T) {
        value = this._getConcreteValue(value);
        if (this.isSelected(value)) {
            this._selection.delete(value);

            if (this._emitChanges) {
                this._deselectedToEmit.push(value);
            }
        }
    }

    /** Clears out the selected values. */
    private _unmarkAll() {
        if (!this.isEmpty()) {
            this._selection.forEach(value => this._unmarkSelected(value));
        }
    }

    /**
     * Verifies the value assignment and throws an error if the specified value array is
     * including multiple values while the selection model is not supporting multiple values.
     */
    private _verifyValueAssignment(values: T[]) {
        if (values.length > 1 && !this._multiple && isDevMode()) {
            throw getMultipleValuesInSingleSelectionError();
        }
    }

    /** Whether there are queued up change to be emitted. */
    private _hasQueuedChanges() {
        return !!(this._deselectedToEmit.length || this._selectedToEmit.length);
    }

    /** Returns a value that is comparable to inputValue by applying compareWith function, returns the same inputValue otherwise. */
    private _getConcreteValue(inputValue: T, selection?: Set<T>): T {
        if (!this.compareWith) {
            return inputValue;
        } else {
            selection = selection ?? this._selection;
            for (const selectedValue of selection) {
                if (this.compareWith(inputValue, selectedValue)) {
                    return selectedValue;
                }
            }
            return inputValue;
        }
    }
}

/**
 * Event emitted when the value of a MatSelectionModel has changed.
 * @docs-private
 */
export interface CSSelectionChange<T> {
    /** Model that dispatched the event. */
    source: CSSelectionModel<T>;
    /** Options that were added to the model. */
    added: T[];
    /** Options that were removed from the model. */
    removed: T[];
}

/**
 * Returns an error that reports that multiple values are passed into a selection model
 * with a single value.
 * @docs-private
 */
export function getMultipleValuesInSingleSelectionError() {
    return Error('Cannot pass multiple values into SelectionModel with single-value mode.');
}