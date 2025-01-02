export function preventEvent(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    return false;
}

export function focusElement(element: Element | null) {
    if (!element)
        return;
    scrollIntoViewIfNeeded(element, false);
    (element as HTMLElement).focus?.({ preventScroll: true });
}

export function scrollIntoViewIfNeeded(element: Element | null, centerIfNeeded = true) {
    if (!element)
        return;
    verifyScrollIntoViewIfNeeded();
    element.scrollIntoViewIfNeeded(centerIfNeeded);
}

declare global {
    interface Element {
        scrollIntoViewIfNeeded: (bool?: boolean) => void;
    }
}

verifyScrollIntoViewIfNeeded();
function verifyScrollIntoViewIfNeeded() {
    if (!Element.prototype.scrollIntoViewIfNeeded) {
        Element.prototype.scrollIntoViewIfNeeded = function (centerIfNeeded = true) {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const el = this;
            new IntersectionObserver(([entry], self) => {
                const ratio = entry.intersectionRatio;
                if (ratio < 1) {
                    const place = ratio <= 0 && centerIfNeeded ? 'center' : 'nearest';
                    el.scrollIntoView({ block: place, inline: place });
                }
                self.disconnect();
            }).observe(this);
        };
    }
}
