import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { provideCodinusLocalizer } from '@ngx-codinus/cdk/localization';
import { provideCodinusDateProvider } from '@ngx-codinus/material/date-adapter';
import { appRoutes } from './app.routes';
import { provideCodinusHttpService } from '@ngx-codinus/cdk/http';
import { provideValueFormatter } from '@ngx-codinus/core/format';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideAnimationsAsync(),
    provideCodinusDateProvider(),
    provideCodinusHttpService(),
    provideCodinusLocalizer(),
    provideValueFormatter(),
  ],
};
