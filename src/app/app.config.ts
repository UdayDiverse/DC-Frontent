import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withViewTransitions,
} from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { authInterceptor } from './core/interceptor/request.interceptor';
import { responseInterceptor } from './core/interceptor/response.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';
import { BootService } from './core/service/boot.service';
import { initializeAppFactory } from './core/initializer/app.initializer';
import { DatePipe } from '@angular/common';

// add ExportAsService later

export const appConfig: ApplicationConfig = {
  providers: [
    BootService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppFactory,
      deps: [BootService],
      multi: true,
    },
    provideHttpClient(
      withInterceptors([authInterceptor, responseInterceptor]),
      withFetch()
    ),
    provideAnimations(),
    provideToastr({
      autoDismiss: true,
      newestOnTop: true,
      tapToDismiss: true,
      progressAnimation: 'increasing',
      timeOut: 10000,
    }),
    provideClientHydration(),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    DatePipe,
  ],
};
