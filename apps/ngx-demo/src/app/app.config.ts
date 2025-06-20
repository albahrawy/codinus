import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { provideCodinusLocalizer } from '@ngx-codinus/cdk/localization';
import { provideCodinusDateProvider } from '@ngx-codinus/material/date-adapter';
import { appRoutes } from './app.routes';
import { provideCodinusHttpService } from '@ngx-codinus/cdk/http';
import { provideValueFormatter } from '@ngx-codinus/core/format';
import { provideCSTableComponentFactory } from '@ngx-codinus/material/table-editors';
import { provideCodinusRuntimeForms } from '@ngx-codinus/material/forms';
import { provideCSDialogService } from '@ngx-codinus/material/overlays';
import { provideMonacoTsLibService } from '@ngx-codinus/monaco-editor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideAnimationsAsync(),
    provideCodinusDateProvider(),
    provideCodinusHttpService(),
    provideCodinusLocalizer(),
    provideValueFormatter(),
    provideCSTableComponentFactory(),
    provideCodinusRuntimeForms(),
    provideCSDialogService(),
    provideMonacoTsLibService()
  ],
};
