import { ICSTableApiEditable } from "../api/types";
import { CSTableApiEditModelBase } from "../editors/table-api-editable-model";

export class CSTableApiEditModel
    extends CSTableApiEditModelBase implements ICSTableApiEditable {

    get editable() { return true; }
    set editable(value: boolean) { throw new Error("Editable property is read only for CSTableFormInput") }
}