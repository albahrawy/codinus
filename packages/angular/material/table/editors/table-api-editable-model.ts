import { Signal } from "@angular/core";
import { forceInputSet } from "@ngx-codinus/core/shared";
import { EditablePredicate, ICSTableApiEditable } from "../api/types";

export interface ICSTableApiEditableSupport {
    readOnly: Signal<boolean>;
    commitOnDestroy: Signal<boolean>;
    editWithF2: Signal<boolean>;
    editWithEnter: Signal<boolean>;
    editablePredicate: Signal<EditablePredicate>;
}

type ICSTableApiEditableSupportWithEditable = ICSTableApiEditableSupport & { editable: Signal<boolean> };

export abstract class CSTableApiEditModelBase<T extends ICSTableApiEditableSupport = ICSTableApiEditableSupport> {

    constructor(protected directive: T) {
    }

    get commitOnDestroy() { return this.directive.commitOnDestroy(); }
    set commitOnDestroy(value: boolean) {
        forceInputSet(this.directive.commitOnDestroy, value);
    }

    get editWithF2() { return this.directive.editWithF2(); }
    set editWithF2(value: boolean) {
        forceInputSet(this.directive.editWithF2, value);
    }

    get editWithEnter() { return this.directive.editWithEnter(); }
    set editWithEnter(value: boolean) {
        forceInputSet(this.directive.editWithEnter, value);
    }

    get editablePredicate() { return this.directive.editablePredicate(); }
    set editablePredicate(value: EditablePredicate) {
        forceInputSet(this.directive.editablePredicate, value);
    }
}

export class CSTableApiEditModel
    extends CSTableApiEditModelBase<ICSTableApiEditableSupportWithEditable> implements ICSTableApiEditable {

    get editable() { return this.directive.editable(); }
    set editable(value: boolean) {
        forceInputSet(this.directive.editable, value);
    }
}