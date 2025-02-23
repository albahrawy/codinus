export function preventEvent(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    return false;
}

export function scrollIntoViewIfNeeded(element: Element | null, root?: Element | null, rootMargin?: string)
    : Promise<void> | null {
    if (!element)
        return null;
    return new Promise((resolve) => {
        new IntersectionObserver(([entry], self) => {
            const ratio = entry.intersectionRatio;
            if (ratio < 1) {
                const { bottom: eBottom, top: eTop } = entry.boundingClientRect;
                const { bottom: rBottom, top: rTop } = entry.rootBounds ?? { top: 0, bottom: 0 };

                const block = eBottom > rBottom ? 'end'
                    : eTop < rTop ? 'start' : 'nearest';

                element.scrollIntoView({ block, inline: 'nearest' });
            }
            self.disconnect();
            resolve();
        }, { root, rootMargin }).observe(element);
    });
}

export function focusElement(element: Element | null, preventScroll = true) {
    (element as HTMLElement)?.focus?.({ preventScroll });
}

export function scrollIntoViewAndFocus(element: Element | null, root?: Element | null, rootMargin?: string) {
    scrollIntoViewIfNeeded(element, root, rootMargin)?.then(() => focusElement(element));
}