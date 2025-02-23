import { booleanAttribute, computed, Directive, input } from '@angular/core';

@Directive({
    selector: 'cs-split-button-item'
})

export class CSSplitButtonItem {
    key = input.required<string>();
    text = input<string>();
    icon = input<string>();
    disabled = input(false, { transform: booleanAttribute });
    hidden = input(false, { transform: booleanAttribute });

    splitButtonItem = computed(() => ({

        key: this.key(),
        text: this.text(),
        icon: this.icon(),
        disabled: this.disabled(),
        hidden: this.hidden()
    }));
}