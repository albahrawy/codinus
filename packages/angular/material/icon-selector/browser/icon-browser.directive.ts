import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { computed, Directive, inject, Input, Signal, signal, viewChild } from '@angular/core';
import { Nullable } from '@codinus/types';
import { HtmlElementRuler } from '@ngx-codinus/core/observer';
import { DEFAULT_MATERIAL_ICONS } from '../default-icons';

@Directive({
    host: {
        'class': 'cs-icon-browser',
        '[style.--cs-icon-browser-item-size.px]': 'itemSize()',
    },
    hostDirectives: [HtmlElementRuler],
})

export abstract class CSIconBrowserBase {

    protected _htmlElementRuler = inject(HtmlElementRuler, { self: true });

    abstract iconList: Signal<Nullable<string[]>>; // Icons to display
    abstract iconCssClass: Signal<Nullable<string>>; // CSS class to apply to the icon;
    abstract itemSize: Signal<number>; // Size of each icon

    private _cdkScrollViewPort = viewChild(CdkVirtualScrollViewport);

    protected searchText = signal<string | null>(null);
    protected selectedIcon = signal<Nullable<string>>(null);
    protected availableIcons = computed(() => {
        const iconList = this.iconList() ?? DEFAULT_MATERIAL_ICONS;
        const searchText = this.searchText();
        if (searchText) {
            return iconList.filter(icon => icon.includes(searchText));
        }
        return iconList;
    });

    protected _iconCssClasses = computed(() => ['cs-icon-browser-icon', this.iconCssClass() ?? 'material-icons']);
    protected trackByFn = (index: number, icon: string) => icon;
    protected _onIconClick(icon: string) {
        this.selectedIcon.set(icon)
    }

    protected _onIconDblClick(icon: string) {
        this.selectedIcon.set(icon)
    }

    @Input()
    get value() { return this.selectedIcon(); }
    set value(value: Nullable<string>) {
        this.selectedIcon.set(value);
        this.scrollToSelected();
    }

    scrollToSelected() {
        const selected = this.selectedIcon();
        if (selected)
            this.scrollToIndex(this.availableIcons().indexOf(selected));
    }

    scrollToIndex(index: number) {
        this._cdkScrollViewPort()?.scrollToIndex(index);
    }
}