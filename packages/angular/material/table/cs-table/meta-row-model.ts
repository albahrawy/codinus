import { forceInputSet } from "@ngx-codinus/core/shared";
import { untracked } from "@angular/core";
import { ICSTableApiMetaRowVisibility } from "../api";
import { CSTableDirective } from "./cs-table.directive";

export class CSTableMetaRowModel<TRecord> implements ICSTableApiMetaRowVisibility {
    /**
     *
     */
    constructor(private directive: CSTableDirective<TRecord>) { }

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