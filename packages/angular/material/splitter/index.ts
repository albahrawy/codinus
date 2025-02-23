import { CSSplitter } from './split.component';
import { CSSplitPane } from './split.pane.component';

export * from './split.component';
export * from './split.pane.component';
export * from './splitter-gutter.component';
export * from './types';

export const CSplitterModule = [CSSplitter, CSSplitPane] as const;