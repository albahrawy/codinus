import { forceInputSet } from "@ngx-codinus/core/shared";
import { CSTableMetaRowsVisiblity } from "./meta-rows-visiblity.directive";
import { ICSTableApiMetaRowVisibility } from "./types";
import { untracked } from "@angular/core";

export class StandardMetaRowModel implements ICSTableApiMetaRowVisibility {
    /**
     *
     */
    constructor(private directive: CSTableMetaRowsVisiblity) { }

    getVisibility(key: 'header' | 'filter' | 'footer') {
        const propKey = this.getPropKey(key);
        if (!propKey)
            return false;
        return untracked(() => this.directive[propKey]());
    }

    setVisibility(key: 'header' | 'filter' | 'footer', value: boolean) {
        const propKey = this.getPropKey(key);
        if (!propKey)
            return;
        forceInputSet(this.directive[propKey], value);
    }

    private getPropKey(key: string) {
        return key === 'header'
            ? 'showHeader'
            : key === 'filter'
                ? 'showFilter'
                : key === 'footer'
                    ? 'showFooter'
                    : null;
    }
}