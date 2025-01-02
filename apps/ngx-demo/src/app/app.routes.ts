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
        path: 'inputs-extensions', loadComponent: () => import('./material-input-extensions/material-input-extensions')
            .then(mod => mod.MaterialInputExtensionComponent)
    },
    {
        path: 'forms', loadComponent: () => import('./form/form')
            .then(mod => mod.CSTestFormComponent)
    },
    {
        path: 'tabs', loadComponent: () => import('./tab-example/tab-example')
            .then(mod => mod.TabGroupExampleComponent)
    },
    {
        path: 'snack-bar', loadComponent: () => import('./snack-bar/snack-bar')
            .then(mod => mod.SnackBarExampleComponent)
    },
    {
        path: 'function-test', loadComponent: () => import('./test.component')
            .then(mod => mod.FnTestComponent)
    },
];

