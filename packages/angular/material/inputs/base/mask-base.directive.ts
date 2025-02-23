import { isPlatformBrowser } from "@angular/common";
import { Directive, ElementRef, PLATFORM_ID, Signal, computed, effect, inject, input } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { Nullable } from "@codinus/types";
import { createValueAccessorInterceptor } from "@ngx-codinus/core/shared";
import { Caret, MaskConfig } from "./mask-handler";

type Browser = { chromeAndroid?: boolean, android?: boolean, iPhone?: boolean };
class InternalEvent extends InputEvent { };
//TODO: Fix change model on completion and validate value based on mask
@Directive({
    host: {
        '(input)': '_onInput($event)',
        '(blur)': '_onBlur($event)',
        '(focus)': '_onFocus($event)',
        '(keydown)': '_onKeyDown($event)',
        '(keypress)': '_onKeyPress($event)',
        '(paste)': '_onPaste($event)'
    }
})
export abstract class CSMaskInputBase {

    private _initialized = false;
    private oldVal?: string;
    private focusText = '';
    private caretTimeoutId: number | undefined;

    protected _elementRef: ElementRef<HTMLInputElement> = inject(ElementRef);
    private platformId = inject(PLATFORM_ID);
    private inputValueAccessors = inject(NG_VALUE_ACCESSOR, { optional: true, self: true });

    private readonly _acceesorProxy = createValueAccessorInterceptor(this.inputValueAccessors, v => this.writeValue(v));
    private get readonly() { return this._elementRef?.nativeElement.readOnly; }
    private readonly _inputEvent = new InternalEvent('input', { bubbles: true, cancelable: false });
    private readonly _changeEvent = new Event('change', { bubbles: true, cancelable: false });
    private _browser: Browser = fetchBrowserInfo(this.platformId);
    private _accessorHandler = { caret: this.caret.bind(this), writeBuffer: () => this.writeBuffer() };

    private _maskChangedEffect = effect(() => {
        const maskConfig = this.maskConfig();
        if (!maskConfig && !this._initialized)
            this._initialized = true;
        else if (this._initialized)
            this.maskChanged();
    });

    protected get buffer() { return this.maskConfig()?.buffer; }
    protected abstract mask: Signal<Nullable<string>>;
    protected abstract useUnmaskValue: Signal<boolean>;
    protected abstract clearOnInvalid: Signal<boolean>;

    placeHolderChar = input('-', { transform: (v: Nullable<string>) => v || '-' });

    protected maskConfig = computed(() => {
        const mask = this.mask();
        if (!mask?.length)
            return null;

        return new MaskConfig(mask, this.placeHolderChar(), this._accessorHandler);
    });

    protected value: Nullable<string>;

    //#region events

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected onKeyDown(event: KeyboardEvent, position: Nullable<Caret>) {/** */ }

    protected writeBuffer() {
        this._elementRef.nativeElement.value = this.maskConfig()?.getBufferValue() ?? '';
    }

    protected changeModel(value: unknown, raiseInputEvent: boolean) {
        if (raiseInputEvent)
            this.dispatchInputEvent();
        this._acceesorProxy?.change(value);
    }

    protected maskChanged() {
        this.writeValue(this.value);
    }

    _onInput(event: Event) {
        if (!this.maskConfig() || event instanceof InternalEvent)
            return;

        if (this._browser.chromeAndroid)
            this._handleAndroidInput(event);
        else
            this._handleInputChange(event);
    }

    _onBlur(e: Event) {
        if (!this.maskConfig())
            return;
        this.processValue();
        const elValue = this._elementRef?.nativeElement.value;
        if (!elValue && !this.focusText && !this.value)
            return;
        if (this._elementRef?.nativeElement.value != this.focusText || this._elementRef?.nativeElement.value != this.value) {
            this.updateModel(e, false);
            this.dispatchChangeEvent();
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _onFocus(event: Event) {
        if (!this.maskConfig() || this.readonly)
            return;

        clearTimeout(this.caretTimeoutId);
        const el = this._elementRef.nativeElement;
        this.focusText = el.value;
        const pos = this.processValue();

        this.caretTimeoutId = setTimeout(() => {
            if (el !== el.ownerDocument.activeElement)
                return;
            this.writeBuffer();
            if (pos === this.mask()?.replace('?', '').length)
                this.caret(0, pos);
            else
                this.caret(pos);
        }, 10);
    }

    _onKeyDown(e: KeyboardEvent) {
        if (!this.maskConfig() || this.readonly)
            return;
        this.oldVal = this._elementRef?.nativeElement.value;
        //backspace, delete, and escape get special treatment
        if (e.key === 'Delete' || e.key === 'Backspace' || (this._browser.iPhone && e.key === 'Escape')) {
            this.maskConfig()?.processSpecialKey(e.key, this.caret());
            this.updateModel(e, true);
            e.preventDefault();
        } else if (e.key === 'Enter') {
            this._onBlur(e);
            this.updateModel(e, true);
        } else if (e.key === 'Escape') {
            (this._elementRef as ElementRef).nativeElement.value = this.focusText;
            this.caret(0, this.processValue());
            this.updateModel(e, true);
            e.preventDefault();
        } else {
            this.onKeyDown(e, this.caret());
        }
    }

    _onKeyPress(e: KeyboardEvent) {
        const maskConfig = this.maskConfig();
        if (!maskConfig || this.readonly)
            return;

        let completed = false;

        if (e.ctrlKey || e.altKey || e.metaKey) {
            //Ignore
            return;
        } else if (e.key && e.key !== 'Enter') {
            const processed = maskConfig.processKey(e.key, this.caret());
            if (processed) {
                if (this._browser.android)
                    setTimeout(() => this.caret(processed.next));
                else
                    this.caret(processed.next);
                completed = processed.completed;
            }
            e.preventDefault();
        }

        this.updateModel(e, true);
        if (completed) {
            this._onComplete();
        }
    }

    protected dispatchInputEvent(): void {
        this._elementRef.nativeElement.dispatchEvent(this._inputEvent);
    }

    protected dispatchChangeEvent(): void {
        this._elementRef.nativeElement.dispatchEvent(this._changeEvent);
    }

    _onPaste(e: Event) {
        if (!this.maskConfig() || this.readonly) {
            return;
        }

        this._handleInputChange(e);
    }

    //#endregion

    //#region private methods

    protected writeValue(value: unknown): void {
        if (!this.maskConfig())
            return;
        this.value = value as Nullable<string>;
        const el = this._elementRef?.nativeElement;

        if (el) {
            if (this.value == null)
                el.value = '';
            else
                el.value = this.value;

            this.processValue();
            this.focusText = el.value;
        }
    }

    protected caret(first?: Nullable<number>, last?: Nullable<number>): Caret | null {
        if (!this.maskConfig())
            return null;

        const el = this._elementRef.nativeElement;

        if (!el?.offsetParent || el !== el.ownerDocument.activeElement) {
            return null;
        }
        let begin, end;
        if (typeof first == 'number') {
            begin = first;
            end = typeof last === 'number' ? last : begin;
            el.setSelectionRange(begin, end);
        } else {

            begin = el.selectionStart ?? 0;
            end = el.selectionEnd ?? 0;
            return { begin, end };
        }
        return null;
    }

    private processValue(writeBufferOnly = false): Nullable<number> {
        const maskConfig = this.maskConfig();
        if (!maskConfig)
            return -1;

        const el = this._elementRef?.nativeElement;
        const processed = maskConfig.processValue(el.value, writeBufferOnly, this.clearOnInvalid());
        el.value = processed.value;
        return processed.position;
    }

    private _handleInputChange(event: Event) {
        if (!this.maskConfig() || this.readonly)
            return;

        setTimeout(() => {
            const pos = this.processValue(true);
            this.caret(pos);
            this.updateModel(event, false);
            if (this.maskConfig()?.isCompleted()) {
                this._onComplete();
            }
        });
    }

    private _handleAndroidInput(e: Event) {
        if (!this.maskConfig())
            return;
        const curVal = this._elementRef?.nativeElement.value;
        const pos = this.caret() as Caret;
        this.processValue(true);
        this.maskConfig()?.shiftPosition(pos, (this.oldVal?.length ?? 0) > curVal.length);
        setTimeout(() => {
            this.caret(pos.begin, pos.begin);
            this.updateModel(e, false);
        }, 0);
    }

    private updateModel(e: Event, raiseInputEvent: boolean) {
        const maskConfig = this.maskConfig();
        if (!maskConfig)
            return;

        const updatedValue = this.useUnmaskValue() ? maskConfig.getUnmaskedValue() : (e.target as HTMLInputElement).value;
        if (updatedValue != null) {
            this.value = updatedValue;
            // if (maskConfig.isCompleted())
            this.changeModel(this.value, raiseInputEvent);
        }
    }

    protected _onComplete() {/** */ }

    protected update(event: Event) {
        this.updateModel(event, true);
        if (this.maskConfig()?.isCompleted())
            this._onComplete();
    }

    //#endregion
}

function fetchBrowserInfo(platformId: object): Browser {
    if (!isPlatformBrowser(platformId))
        return {};
    const ua = navigator.userAgent;
    const android = /android/i.test(ua);
    return {
        android,
        chromeAndroid: android && /chrome/i.test(ua),
        iPhone: /iphone/i.test(ua)
    };
}