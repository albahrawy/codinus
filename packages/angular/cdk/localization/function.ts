import { Directionality } from "@angular/cdk/bidi";
import { inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";

export function signalDir() {
    return toSignal(inject(Directionality).change);
}