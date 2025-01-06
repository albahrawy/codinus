import { CSTableResponsiveVirtualScroll } from './fixed-size-strategy';
import { CSTableResponsiveView } from './responsive-view';
import { CSTableResposiveVirtualScrollDataHandler } from './virtual-scroll-data-handler';

export * from './fixed-size-strategy';
export * from './responsive-view';
export * from './virtual-scroll-data-handler';

export const CODINUS_TABLE_RESPONSIVE = [CSTableResponsiveView,
    CSTableResponsiveVirtualScroll, CSTableResposiveVirtualScrollDataHandler] as const;