import { NgModule } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { MatTableModule } from "@angular/material/table";
import { CSTableApiIRegistrar, CSTableMetaRowsVisiblity } from "../api";
import { CODINUS_TABLE_CELLS } from "../cells";
import { CODINUS_TABLE_COLUMNS } from "../columns";
import { CSTableDirective } from "../cs-table";
import { CODINUS_TABLE_DATA_DIRECTIVES } from "../data";
import { CODINUS_TABLE_EDITORS } from "../editors";
import { CODINUS_TABLE_SELECTION_NAVIGATION } from "../features";
import { CODINUS_TABLE_FILTERS } from "../filters";
import { CSTableFormInput } from "../form-control/table-form-input";
import { CODINUS_TABLE_RESPONSIVE_DIRECTIVES } from "../responsive";
import { CODINUS_TABLE_VIRTUAL_SCROLL, CSTableVirtualScrollable } from "../scroll";

const TABLE_IMPORTS = [
    MatTableModule, CSTableVirtualScrollable, MatIconModule,
    ...CODINUS_TABLE_RESPONSIVE_DIRECTIVES, ...CODINUS_TABLE_SELECTION_NAVIGATION, ...CODINUS_TABLE_CELLS,
    ...CODINUS_TABLE_COLUMNS, ...CODINUS_TABLE_DATA_DIRECTIVES,
    ...CODINUS_TABLE_VIRTUAL_SCROLL, ...CODINUS_TABLE_EDITORS, ...CODINUS_TABLE_FILTERS,
    CSTableMetaRowsVisiblity, CSTableApiIRegistrar, CSTableDirective, CSTableFormInput
];

@NgModule({
    imports: TABLE_IMPORTS,
    exports: TABLE_IMPORTS,
})
export class CodinusTableModule { }