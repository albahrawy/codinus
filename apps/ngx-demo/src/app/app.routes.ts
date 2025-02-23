import { Route } from '@angular/router';

export const appRoutes: Route[] = [
    {
        path: 'progress-overlay', loadComponent: () => import('./progress-overlay/progress-overlay.component')
            .then(mod => mod.TestProgressOverlayComponent)
    },
    {
        path: 'buttons', loadComponent: () => import('./buttons/buttons')
            .then(mod => mod.ButtonsExampleComponent)
    },
    {
        path: 'icon-selector', loadComponent: () => import('./icon-selector/icon-selector-example')
            .then(mod => mod.IconSelectorExample)
    },
    {
        path: 'inputs-extensions', loadComponent: () => import('./material-input-extensions/material-input-extensions')
            .then(mod => mod.MaterialInputExtensionComponent)
    },
    {
        path: 'cs-mat-table', loadComponent: () => import('./table/mat-table.component')
            .then(mod => mod.TestMatTableComponent)
    },
    {
        path: 'codinus-table', loadComponent: () => import('./table/codinus-table/codinus-table')
            .then(model => model.CdoinusTableExampleComponent)
    },
    {
        path: 'table-form-control', loadComponent: () => import('./table/form-control/form-control')
            .then(mod => mod.TableFormExampleComponent)
    },
    {
        path: 'forms', loadComponent: () => import('./form/form')
            .then(mod => mod.CSTestFormComponent)
    },
    {
        path: 'form-array', loadComponent: () => import('./form-array-view/form-array')
            .then(mode => mode.FormArrayViewExampleComponent)
    },
    {
        path: 'form-array-tree', loadComponent: () => import('./form-array-tree-view/form-array-tree-view')
            .then(mode => mode.FormArrayTreeViewExampleComponent)
    },
    {
        path: 'runtime-form', loadComponent: () => import('./runtime-form/form')
            .then(mod => mod.CSRuntimeFromExampleComponent)
    },
    {
        path: 'select-example', loadComponent: () => import('./cs-select-example/cs-select-example')
            .then(mod => mod.CSSelectExampleComponent)
    },
    {
        path: 'tabs', loadComponent: () => import('./tab-example/tab-example')
            .then(mod => mod.TabGroupExampleComponent)
    },
    {
        path: 'tree', loadComponent: () => import('./cs-tree-example/cs-tree-example')
            .then(mod => mod.CSTreeExample)
    },
    {
        path: 'splitter', loadComponent: () => import('./splitter-demo/nested-split.component')
            .then(mode => mode.NestedComponent)
    },
    {
        path: 'snack-bar', loadComponent: () => import('./snack-bar/snack-bar')
            .then(mod => mod.SnackBarExampleComponent)
    },
    {
        path: 'selection-list', loadComponent: () => import('./mat-list-seelction-virtual/mat-list-seelction-virtual')
            .then(mod => mod.CSSelectionListVirtualComponent)
    },
    {
        path: 'flex-layout', loadComponent: () => import('./flex-layout/flex-layout-example')
            .then(mod => mod.FlexLayoutExampleComponent)
    },
    {
        path: 'function-test', loadComponent: () => import('./test.component')
            .then(mod => mod.FnTestComponent)
    },
    {
        path: 'page-setup', loadComponent: () => import('@ngx-codinus/app-setup')
            .then(mod => mod.CSPageSetup)
    },
    {
        path: 'AdminPage2', loadComponent: () => import('@ngx-codinus/app-setup')
            .then(mod => mod.CSPageSetup)
    },
];

