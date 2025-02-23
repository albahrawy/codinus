import { Provider, Type } from "@angular/core";
import { CODINUS_TABLE_COMPONENT_FACTORY, ICSTableComponentFactory } from "@ngx-codinus/material/table";
import { CSDefaultEditorComponentFactory } from "./component-factory";


export function provideCSTableComponentFactory(customFactory?: Type<ICSTableComponentFactory>): Provider {
    return { provide: CODINUS_TABLE_COMPONENT_FACTORY, useExisting: customFactory ?? CSDefaultEditorComponentFactory };
}