import { Provider } from "@angular/core";
import { DefaultValueFormatter } from "./default-value-formater";
import { CODINUS_VALUE_FORMATTER } from "./types";

export function provideValueFormatter(): Provider {

    return { provide: CODINUS_VALUE_FORMATTER, useExisting: DefaultValueFormatter };

}