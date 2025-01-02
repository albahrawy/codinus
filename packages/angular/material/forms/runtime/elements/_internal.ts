import { ReactiveFormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { CODINUS_REACTIVE_FORMS } from "@ngx-codinus/core/forms";
import { CSInputClearButton } from "@ngx-codinus/material/inputs";

export const ELEMENT_IMPORTS = [ReactiveFormsModule, CODINUS_REACTIVE_FORMS, MatInputModule, CSInputClearButton] as const;