import { CSTableFixedSizeVirtualScroll } from './fixed-size-strategy';
import { CSTableVirtualScrollable } from './table-virtual-scrollable';
import { CSTableVirtualScrollDataHandler } from './virtual-scroll-data-handler';

export * from './fixed-size-strategy';
export * from './table-virtual-scrollable';
export * from './types';
export * from './virtual-scroll-data-handler';
export * from './virtual-scroll-data-handler-base';

export const CODINUS_TABLE_VIRTUAL_SCROLL = [CSTableVirtualScrollable, CSTableFixedSizeVirtualScroll,
    CSTableVirtualScrollDataHandler] as const;